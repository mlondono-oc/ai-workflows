import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getEnv } from '../../config/env.js';

type FlightOption = { price: number; airline: string };

function getTodayBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function getTomorrowBogota(): string {
  const today = getTodayBogota();
  const [y, m, d] = today.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

function resolveOutboundDate(date: string): string {
  const todayStr = getTodayBogota();
  return date <= todayStr ? getTomorrowBogota() : date;
}

function normalizePrice(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const n = Number(value.replace(/[^\d.]/g, ''));
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function airlineLabel(flights: Array<{ airline?: string }> | undefined): string {
  if (!flights?.length) {
    return 'Desconocida';
  }
  const names = flights.map((f) => f.airline).filter(Boolean) as string[];
  if (names.length === 0) {
    return 'Desconocida';
  }
  return [...new Set(names)].join(' / ');
}

function collectFlightOptions(data: Record<string, unknown>): FlightOption[] {
  const best = Array.isArray(data.best_flights) ? data.best_flights : [];
  const other = Array.isArray(data.other_flights) ? data.other_flights : [];
  const combined = [...best, ...other] as Array<{
    price?: unknown;
    flights?: Array<{ airline?: string }>;
  }>;

  const out: FlightOption[] = [];
  for (const item of combined) {
    const price = normalizePrice(item.price);
    if (price === null) {
      continue;
    }
    out.push({ price, airline: airlineLabel(item.flights) });
  }
  return out.sort((a, b) => a.price - b.price);
}

function readPriceInsights(data: Record<string, unknown>): {
  lowest: unknown;
  range: unknown;
} {
  const pi = data.price_insights as Record<string, unknown> | undefined;
  if (!pi) {
    return { lowest: undefined, range: undefined };
  }
  return {
    lowest: pi.lowest_price,
    range: pi.typical_price_range,
  };
}

function buildSerpApiUrl(
  apiKey: string,
  input: {
    departure_id: string;
    arrival_id: string;
    outbound_date: string;
    return_date?: string;
    budget: number;
    adults: number;
  },
): string {
  const params = new URLSearchParams({
    engine: 'google_flights',
    api_key: apiKey,
    departure_id: input.departure_id,
    arrival_id: input.arrival_id,
    outbound_date: input.outbound_date,
    currency: 'USD',
    adults: String(input.adults),
    max_price: String(input.budget),
    hl: 'es',
  });

  if (input.return_date) {
    params.set('return_date', input.return_date);
    params.set('type', '1');
  } else {
    params.set('type', '2');
  }

  return `https://serpapi.com/search?${params.toString()}`;
}

function summarizeFlights(
  options: FlightOption[],
  budget: number,
  insights: { lowest: unknown; range: unknown },
  outboundUsed: string,
): string {
  const parts: string[] = [];
  parts.push(`Fecha de salida usada: ${outboundUsed} (America/Bogota).`);

  if (insights.lowest != null) {
    parts.push(`Precio más bajo (price_insights): ${String(insights.lowest)} USD.`);
  }
  if (Array.isArray(insights.range) && insights.range.length >= 2) {
    parts.push(
      `Rango típico en esta ruta: ${String(insights.range[0])}–${String(insights.range[1])} USD.`,
    );
  }

  if (options.length === 0) {
    parts.push('No se encontraron vuelos en la respuesta.');
    return parts.join('\n');
  }

  const minPrice = options[0].price;
  const withinBudget = options.some((o) => o.price <= budget);
  if (withinBudget) {
    parts.push(
      `Hay opciones desde ${minPrice} USD dentro o por debajo del presupuesto (${budget} USD).`,
    );
  } else {
    parts.push(
      `El precio más bajo encontrado es ${minPrice} USD, por encima del presupuesto (${budget} USD).`,
    );
  }

  parts.push('Tres opciones más baratas:');
  for (let i = 0; i < Math.min(3, options.length); i++) {
    const o = options[i];
    parts.push(`${i + 1}. ${o.airline}: ${o.price} USD`);
  }

  return parts.join('\n');
}

export const flightSearchTool = tool(
  async (rawInput) => {
    const env = getEnv();
    const outboundUsed = resolveOutboundDate(rawInput.outbound_date);
    const url = buildSerpApiUrl(env.SERPAPI_API_KEY, {
      departure_id: rawInput.departure_id,
      arrival_id: rawInput.arrival_id,
      outbound_date: outboundUsed,
      return_date: rawInput.return_date,
      budget: rawInput.budget,
      adults: rawInput.adults,
    });

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      return 'No se pudo conectar con el servicio de vuelos. Revisa tu conexión e intenta de nuevo.';
    }

    if (!response.ok) {
      return `Error al consultar vuelos (HTTP ${response.status}).`;
    }

    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.error === 'string' && data.error.length > 0) {
      return `Error del proveedor de vuelos: ${data.error}`;
    }

    const meta = data.search_metadata as Record<string, unknown> | undefined;
    if (meta?.status === 'Error') {
      return 'La búsqueda de vuelos falló. Intenta de nuevo más tarde.';
    }

    const options = collectFlightOptions(data);
    const insights = readPriceInsights(data);
    return summarizeFlights(options, rawInput.budget, insights, outboundUsed);
  },
  {
    name: 'flight_search',
    description:
      'Busca vuelos y precios vía Google Flights (SerpAPI). Usa códigos IATA para origen y destino y fechas YYYY-MM-DD.',
    schema: z.object({
      departure_id: z
        .string()
        .default('MED')
        .describe('Código IATA de salida. Default: MED (Medellín)'),
      arrival_id: z.string().describe('Código IATA de destino, ej: NRT, HND para Japón'),
      outbound_date: z
        .string()
        .describe('Fecha de salida YYYY-MM-DD. Mínimo: mañana en America/Bogota'),
      return_date: z
        .string()
        .optional()
        .describe('Fecha de regreso YYYY-MM-DD (opcional; ida y vuelta si se indica)'),
      budget: z.number().default(2000).describe('Presupuesto máximo en USD. Default: 2000'),
      adults: z.number().int().min(1).default(1),
    }),
  },
);
