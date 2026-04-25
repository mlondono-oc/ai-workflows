# Plan detallado para construir y fortalecer la aplicación del agente

## 1. Objetivo del plan

Construir y consolidar una aplicación de agente didáctico en español, basada en TypeScript + Node.js + LangChain + OpenRouter, que:

- analice código de forma comprensible,
- genere diagramas útiles y legibles en Excalidraw,
- explique flujos de ejecución de funciones de forma pedagógica,
- mantenga una arquitectura entendible y extensible,
- y preserve calidad mediante pruebas, validación de entorno y documentación.

Este plan traduce el brief en pasos ejecutables para que cualquier integrante del equipo pueda continuar el trabajo de forma consistente.

---

## 2. Principios de ejecución

1. **Enfoque pedagógico primero:** priorizar claridad del análisis y los diagramas sobre complejidad técnica.
2. **Cambios pequeños y verificables:** cada avance debe poder ejecutarse, probarse y explicarse.
3. **Consistencia arquitectónica:** respetar separación de responsabilidades por capas.
4. **Documentar cada decisión relevante:** cambios en comportamiento, límites y configuración deben quedar explícitos.
5. **Evolución segura:** no romper ejecución por consola ni pruebas existentes.

---

## 3. Alcance funcional

### Incluye (MVP fortalecido)

- Entrada de preguntas en lenguaje natural desde consola.
- Análisis de archivo o directorio de código.
- Generación de diagrama de arquitectura de un módulo.
- Explicación del flujo de ejecución de una función específica.
- Respuestas en español con estructura mínima consistente (resumen, alcance, flujo y diagrama).
- Validación estricta de configuración antes de ejecutar.
- Operación en modo lectura sobre el repositorio analizado durante el MVP.

### No incluye (por ahora)

- Revisión automática de PR con comentarios bloqueantes.
- Detección y corrección automática de bugs.
- Generación de código de nuevas funcionalidades.
- Interfaz web.
- Orquestación multiagente.

---

## 4. Plan por fases

## Fase 0: Alineación y línea base

**Objetivo:** asegurar que todo el equipo comparta contexto, límites y criterios de éxito del MVP.

**Actividades:**

- Revisar `docs/brief-agent.md` y confirmar entendimiento común del alcance.
- Levantar estado actual: qué ya funciona, qué falta para cubrir los 3 casos de uso del MVP y qué deuda técnica existe.
- Definir una lista corta de escenarios de validación por caso de uso.

**Entregables:**

- Resumen de estado actual (fortalezas, límites, deuda inmediata).
- Lista de escenarios prioritarios para validar cambios.

**Criterio de salida:**

- El equipo comparte el mismo alcance y evita implementar funcionalidades fuera del MVP.

---

## Fase 1: Consolidación de arquitectura y responsabilidades

**Objetivo:** mantener una estructura clara por capas para facilitar mantenimiento y extensión.

**Actividades:**

- Verificar que cada capa tenga una responsabilidad concreta:
  - entrada,
  - ejecución,
  - composición del agente,
  - capacidades del agente,
  - configuración.
- Reducir acoplamientos innecesarios entre módulos de análisis y generación de diagramas.
- Definir contratos mínimos de entrada/salida para obtener respuestas consistentes.
- Establecer reglas de extensión para futuras capacidades (PR review y bugs) sin afectar el MVP.

**Entregables:**

- Arquitectura confirmada y coherente con el brief.
- Guía breve de extensión segura por capas.

**Criterio de salida:**

- Cualquier integrante puede ubicar rápidamente dónde modificar cada tipo de cambio sin romper el flujo base.

---

## Fase 2: Robustez funcional del agente

**Objetivo:** asegurar resultados útiles en los 3 escenarios del MVP con respuestas claras en español.

**Actividades:**

- Revisar prompt, cadena de razonamiento y selección de herramientas para análisis y diagramación.
- Validar tres grupos de solicitudes:
  - análisis de archivo/directorio,
  - diagrama de arquitectura de módulo,
  - explicación del flujo de una función.
- Ajustar criterios para acotar alcance cuando la consulta sea demasiado amplia.
- Estandarizar formato de salida mínimo (resumen, alcance, flujo, diagrama y breve justificación).

**Entregables:**

- Comportamiento del agente estable en los escenarios principales del MVP.
- Respuestas consistentes en idioma, tono y estructura.

**Criterio de salida:**

- El agente resuelve correctamente los casos esperados del MVP y comunica de forma breve lo que analizó y cómo llegó al resultado.

---

## Fase 3: Gestión de configuración y fallos esperados

**Objetivo:** garantizar arranque seguro y mensajes claros ante configuración incompleta o inválida.

**Actividades:**

- Confirmar validación temprana de variables de entorno críticas (modelo, endpoint, credenciales).
- Mejorar claridad de errores cuando falte configuración o la entrada no sea soportada.
- Documentar checklist mínimo de entorno para ejecutar localmente.
- Confirmar comportamiento de lectura segura sobre repositorios (sin modificación de archivos analizados).

**Entregables:**

- Flujo de arranque con validaciones claras y mensajes accionables.
- Documentación de configuración mínima y fallos comunes.

**Criterio de salida:**

- Ante configuración incompleta o error esperado, el sistema falla de forma controlada, entendible y sin efectos colaterales.

---

## Fase 4: Pruebas y calidad operativa

**Objetivo:** proteger estabilidad del comportamiento actual y facilitar cambios futuros con confianza.

**Actividades:**

- Verificar cobertura de pruebas clave del flujo principal.
- Asegurar pruebas para:
  - análisis de archivo/directorio,
  - diagrama de arquitectura,
  - flujo de ejecución de función,
  - validaciones críticas de configuración.
- Agregar pruebas de formato de salida para consistencia didáctica.
- Ejecutar validaciones de calidad (lint y pruebas) en cada cambio relevante.

**Entregables:**

- Suite de pruebas estable para casos prioritarios del MVP.
- Rutina mínima de calidad antes de aceptar cambios.

**Criterio de salida:**

- Los cambios se aceptan solo si mantienen ejecución correcta, pruebas en verde y consistencia de salida.

---

## Fase 5: Documentación final y handoff

**Objetivo:** dejar el proyecto listo para continuidad por cualquier miembro del equipo.

**Actividades:**

- Actualizar README con guía de uso real, estructura de salida y límites del MVP.
- Sincronizar documentación técnica y funcional (brief + plan + notas operativas).
- Incluir ejemplos de prompts por cada caso de uso del MVP.
- Definir próximos pasos priorizados sin inflar alcance.

**Entregables:**

- Documentación coherente con lo implementado.
- Hoja de ruta de mejoras incrementales.

**Criterio de salida:**

- Una persona nueva puede ejecutar, entender y extender el agente en poco tiempo.

---

## 5. Cronograma sugerido (iterativo)

- **Semana 1:** Fase 0 + Fase 1
- **Semana 2:** Fase 2
- **Semana 3:** Fase 3 + Fase 4
- **Semana 4:** Fase 5 + cierre de pendientes

> Si el equipo tiene menos disponibilidad, se puede ejecutar por bloques quincenales manteniendo el orden de dependencias.

---

## 6. Criterios de aceptación globales (Definition of Done operativa)

Se considera completado cuando:

- El comportamiento del agente coincide con el propósito didáctico y responde en español con claridad.
- Los tres casos prioritarios del MVP (análisis, diagrama, flujo de función) funcionan de forma estable.
- La salida mantiene la estructura mínima definida (resumen, alcance, flujo y diagrama).
- La configuración mínima está validada y bien documentada.
- Las pruebas y validaciones de calidad se ejecutan sin regresiones en el alcance trabajado.
- La documentación refleja con precisión el estado real del proyecto y cómo continuar.

---

## 7. Riesgos y mitigaciones

- **Riesgo:** crecimiento desordenado por agregar capacidades fuera del alcance del MVP.
  - **Mitigación:** control de alcance por fase y validación explícita contra brief antes de implementar.

- **Riesgo:** diagramas poco legibles o demasiado técnicos para onboarding.
  - **Mitigación:** aplicar plantilla visual mínima y revisar claridad con casos de uso reales.

- **Riesgo:** análisis inconsistente en repositorios o lenguajes distintos.
  - **Mitigación:** definir límites de análisis, mensajes de alcance y pruebas representativas multi-lenguaje.

- **Riesgo:** fallas por configuración incompleta en entornos nuevos.
  - **Mitigación:** validación temprana + checklist de arranque + mensajes de error accionables.

- **Riesgo:** regresiones al introducir mejoras funcionales.
  - **Mitigación:** cambios incrementales y ejecución obligatoria de pruebas/lint antes de cerrar.

---

## 8. Próximos pasos recomendados tras este plan

1. Ejecutar Fase 0 en una sesión corta de alineación de equipo.
2. Priorizar una mejora puntual por fase para avanzar en iteraciones pequeñas.
3. Al cierre de cada fase, validar: funcionamiento, pruebas, documentación y claridad pedagógica.
4. Registrar decisiones importantes para mantener trazabilidad de por qué se cambió cada parte.
