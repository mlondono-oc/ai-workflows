# Brief del Agente de Análisis de Código y Generación de Diagramas

## 1. Título de la tarea

Implementación de un agente autónomo didáctico para análisis de código y generación de diagramas que fortalezcan el entendimiento de soluciones, especialmente para nuevos miembros del equipo.

---

## 2. Contexto

Hoy los equipos de desarrollo enfrentan desafíos significativos al incorporarse a proyectos existentes: entender la arquitectura, seguir el flujo de ejecución, revisar código de otros miembros y detectar bugs en PRs. Este proceso consume tiempo valioso y depende de conocimiento tribal que se pierde cuando las personas cambian de equipo.

El valor principal de este proyecto es **acelerar el onboarding** y **mejorar la calidad del código** mediante herramientas que hacen visible lo que normalmente es oculto en la complejidad del software.

El MVP actual no busca resolver todos los problemas de una vez. Su objetivo es demostrar, de forma práctica, que un agente puede:

- Analizar código de manera comprensible para personas con distinto nivel técnico.
- Generar diagramas que expliquen arquitectura y flujo de ejecución.
- Servir como base para funcionalidades futuras (revisión de PRs y apoyo en detección de bugs).

También existen puntos a cuidar a corto plazo:

- El agente debe entender diferentes lenguajes y frameworks sin requerir configuraciones complejas.
- Los diagramas generados deben ser claros, legibles y útiles para personas no técnicas.
- La integración con repositorios de código debe ser segura y no invasiva.
- El proyecto debe mantenerse simple y extensible para no abrumar al equipo con complejidad inicial.
- El proyecto está listo para crecer con nuevas herramientas, pero necesita mantener una forma de trabajo consistente para no perder claridad.

El objetivo de este brief es alinear al equipo en una visión compartida: construir un MVP funcional, educativo y fácil de extender, con foco en calidad, pruebas y comunicación clara.

---

## 3. Requerimientos del proyecto

### Lenguaje y stack

- El proyecto está construido con **TypeScript sobre Node.js moderno**.
- Usa **LangChain** para componer el agente y orquestar el análisis de código.
- Se conecta a **OpenRouter** para acceder al modelo de lenguaje.
- Utiliza **Excalidraw** para generar diagramas visuales.
- Usa **validación de configuración** para asegurar que el entorno esté completo antes de ejecutar.
- Cuenta con **pruebas automatizadas** y validaciones de calidad para mantener estabilidad.

### Arquitectura y enfoque

La solución está dividida en capas claras para que cada parte tenga una responsabilidad concreta:

| Capa | Responsabilidad |
|------|----------------|
| **Entrada** | Recibe código, preguntas o rutas de repositorio del usuario |
| **Ejecución** | Coordina el proceso de análisis y generación de diagramas |
| **Composición** | Arma el agente con modelo, prompts y herramientas específicas |
| **Capacidades del Agente** | Concentra las herramientas del dominio (análisis de código y generación de diagramas) |
| **Configuración** | Centraliza y valida variables de entorno y credenciales |

Este enfoque permite:

- Entender rápido qué hace cada módulo.
- Agregar nuevas capacidades (revisión de PRs, detección de bugs) sin reescribir todo.
- Probar piezas de forma aislada.
- Reducir riesgos al evolucionar el proyecto.

### Input esperado

El sistema espera consultas escritas en lenguaje natural por parte del usuario o análisis de repositorios específicos.

**Tipos de solicitudes contempladas para el MVP:**

- Análisis de un archivo o directorio de código.
- Generación de diagrama de arquitectura de un módulo.
- Explicación del flujo de ejecución de una función específica.

**Tipos de solicitudes fuera de alcance del MVP (fase posterior):**

- Revisión automática de PR con comentarios bloqueantes.
- Detección y corrección automática de bugs.
- Generación de código de nuevas funcionalidades.

**Resultado esperado para el usuario (estructura mínima):**

- Respuesta en español con explicación clara.
- Resumen breve del alcance analizado (qué sí y qué no se evaluó).
- Explicación del flujo en pasos ordenados.
- Diagrama visual generado en Excalidraw (o exportable).
- Explicación breve de cómo el agente llegó a sus conclusiones.
- Uso de herramientas solo cuando realmente aporta valor.

---

## 4. Restricciones

- **Mantener el enfoque pedagógico**: primero claridad, luego complejidad. Los diagramas y explicaciones deben ser comprensibles para nuevos miembros del equipo.
- **Evitar agregar componentes que no aporten al objetivo principal del aprendizaje**: el MVP se enfoca en análisis y diagramas, no en generación automática de código o corrección de bugs.
- **No introducir dependencias innecesarias sin justificación funcional**: cada librería debe tener un propósito claro y medible.
- **Cuidar que cualquier mejora preserve compatibilidad** con la ejecución por consola, pruebas existentes y configuración de entorno.
- **Documentar claramente cualquier cambio** en configuración, comportamiento o límites del agente.
- **Los diagramas generados deben ser legibles** sin requerir conocimientos técnicos avanzados.
- **El agente debe manejar código de diferentes lenguajes** sin requerir configuraciones específicas por lenguaje.
- **Priorizar seguridad y mínima invasión**: el análisis del repositorio debe operar en modo lectura para el MVP, sin modificar archivos del proyecto analizado.
- **Mantener límites de análisis explícitos**: si la consulta es demasiado amplia, el agente debe acotar alcance y comunicarlo.
- **Garantizar consistencia de salida**: las respuestas del MVP deben respetar la estructura mínima definida en este brief.

---

## 5. Definition of Done (DoD)

El trabajo se considera terminado cuando:

- **Funcionalidad básica operativa**: el agente puede analizar código y generar diagramas en Excalidraw.
- **Casos de uso del MVP cubiertos**: al menos se soportan correctamente estos tres casos: (1) análisis de archivo/directorio, (2) diagrama de arquitectura de módulo y (3) explicación de flujo de una función.
- **Diagramas claros y útiles**: cada diagrama identifica componentes principales y relaciones entre ellos de forma legible para nuevos miembros del equipo.
- **Explicaciones en español**: todas las respuestas y análisis están en español con lenguaje accesible.
- **Formato de salida consistente**: toda respuesta del agente incluye resumen, alcance, flujo paso a paso y diagrama.
- **Pruebas automatizadas**: existen tests que cubren funcionalidades principales del MVP y errores de configuración (variables faltantes, credenciales inválidas o entrada no soportada).
- **Documentación completa**: el README y comentarios explican cómo usar, configurar y extender el agente, incluyendo limitaciones del MVP.
- **Brief actualizado**: este documento refleja con precisión el estado actual del proyecto y su dirección inmediata.
- **Criterios de calidad definidos**: queda claro cómo evaluar calidad mínima en cada cambio futuro (ejecución correcta, pruebas, consistencia y documentación).