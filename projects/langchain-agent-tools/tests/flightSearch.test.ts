import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flightSearchTool } from '../src/agent/tools/flightSearch.js';

function getTodayBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function getTomorrowBogota(): string {
  const today = getTodayBogota();
  const [y, m, d] = today.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function serpSuccessPayload(minPrice: number) {
  return {
    best_flights: [
      {
        price: minPrice,
        flights: [{ airline: 'TestAir' }],
      },
    ],
    other_flights: [] as unknown[],
    price_insights: {
      lowest_price: minPrice,
      typical_price_range: [minPrice, minPrice + 100],
    },
  };
}

describe('flightSearchTool', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubEnv('SERPAPI_API_KEY', 'test-serpapi-key');
    vi.stubEnv('OPENROUTER_API_KEY', 'test-openrouter-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('indica opciones dentro del presupuesto cuando hay vuelos baratos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(serpSuccessPayload(450)));
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    const out = await flightSearchTool.invoke({
      departure_id: 'MED',
      arrival_id: 'NRT',
      outbound_date: '2026-06-01',
      budget: 2000,
      adults: 1,
    });

    expect(out).toContain('Hay opciones desde');
    expect(out).toContain('dentro o por debajo del presupuesto');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('departure_id=MED');
    expect(url).toContain('max_price=2000');
  });

  it('advierte cuando todos los precios superan el presupuesto', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse(serpSuccessPayload(3500))) as typeof fetch;

    const out = await flightSearchTool.invoke({
      departure_id: 'MED',
      arrival_id: 'NRT',
      outbound_date: '2026-06-01',
      budget: 2000,
      adults: 1,
    });

    expect(out).toContain('por encima del presupuesto');
    expect(out).not.toContain('dentro o por debajo del presupuesto');
  });

  it('maneja error del proveedor cuando la API devuelve error en JSON', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: 'Invalid API key' })) as typeof fetch;

    const out = await flightSearchTool.invoke({
      departure_id: 'MED',
      arrival_id: 'NRT',
      outbound_date: '2026-06-01',
      budget: 2000,
      adults: 1,
    });

    expect(out).toMatch(/^Error del proveedor de vuelos:/);
  });

  it('reemplaza outbound_date de hoy o pasada por mañana (America/Bogota)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(serpSuccessPayload(500)));
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    const tomorrow = getTomorrowBogota();
    const out = await flightSearchTool.invoke({
      departure_id: 'MED',
      arrival_id: 'NRT',
      outbound_date: getTodayBogota(),
      budget: 2000,
      adults: 1,
    });

    expect(out).toContain(`Fecha de salida usada: ${tomorrow}`);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain(`outbound_date=${encodeURIComponent(tomorrow)}`);
  });

  it('usa MED y presupuesto 2000 por defecto si no se envían', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(serpSuccessPayload(400)));
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    await flightSearchTool.invoke({
      arrival_id: 'BOG',
      outbound_date: '2026-07-10',
    });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('departure_id=MED');
    expect(url).toContain('max_price=2000');
  });
});
