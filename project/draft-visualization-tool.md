# Producto Mínimo Viable (MVP) - Plataforma de Gestión de Imágenes para Visión por Computadora

## 1. Título del Proyecto

**ImageLink: Plataforma de Gestión y Etiquetado Inteligente de Imágenes para CV**

## 2. Descripción General del MVP

ImageLink es una plataforma web minimalista diseñada para ayudar a investigadores y desarrolladores de Visión por Computadora a organizar, etiquetar y explorar colecciones de imágenes. El MVP se centrará en las funcionalidades esenciales para demostrar el valor principal de la idea: facilitar la preparación de conjuntos de datos para el entrenamiento de modelos de Machine Learning.

## 3. Objetivo Principal del MVP

Validar la necesidad de una herramienta que simplifique la visualización y el etiquetado de imágenes, y que explore la utilidad de la búsqueda de similitud basada en embeddings para la gestión de datos.

## 4. Funcionalidades Clave del MVP

### 4.1. Carga y Visualización de Imágenes

*   **Selección de Directorio Local:** El usuario puede especificar una ruta de directorio en su sistema local (o un directorio predefinido en el servidor si es una aplicación web) para cargar imágenes.
*   **Visualización en Cuadrícula (Grid View):** Mostrar miniaturas de todas las imágenes encontradas en el directorio especificado, con paginación si el número de imágenes es grande.
*   **Visualización Detallada:** Al hacer clic en una miniatura, se abre una vista más grande de la imagen con sus metadatos (nombre de archivo, dimensiones).

### 4.2. Etiquetado Manual de Imágenes

*   **Asignación de Etiquetas:** Permite al usuario añadir una o más etiquetas de texto libre a una imagen seleccionada.
*   **Edición/Eliminación de Etiquetas:** Posibilidad de modificar o quitar etiquetas de una imagen.
*   **Persistencia de Etiquetas:** Las etiquetas asignadas se guardan en una base de datos asociada a la imagen (por ejemplo, nombre de archivo, ruta).

### 4.3. Búsqueda y Filtrado Básico

*   **Búsqueda por Nombre de Archivo:** Permite buscar imágenes por una parte de su nombre de archivo.
*   **Filtrado por Etiqueta:** Permite filtrar la visualización de imágenes para mostrar solo aquellas que contienen una etiqueta específica.

### 4.4. Vectorización y Búsqueda de Similitud (Core Feature)

*   **Generación de Embeddings:** Cuando se carga un directorio, la plataforma procesa cada imagen para generar un vector (embedding) utilizando un modelo pre-entrenado de Visión por Computadora (ej. una capa de características de ResNet50 sin el clasificador final).
*   **Búsqueda de Imágenes Similares:** Al seleccionar una imagen, se mostrará una sección con las "N" imágenes más similares en el conjunto de datos, basándose en la distancia de sus vectores (ej. similitud del coseno).
    *   **Nota:** Esta funcionalidad es crucial para validar el concepto de "relación" entre imágenes.

### 4.5. Exportación de Datos

*   **Exportar Metadatos y Etiquetas:** Permite al usuario exportar un archivo (CSV o JSON) que contenga la ruta de las imágenes y sus etiquetas asociadas. Esto facilita la creación de conjuntos de datos para el entrenamiento de modelos.

## 5. Tecnologías Propuestas (Ejemplo)

*   **Frontend:** React / Vue.js / Svelte (para una interfaz de usuario interactiva).
*   **Backend:** Python (Flask / FastAPI / Django) para la lógica de negocio, procesamiento de imágenes y API.
*   **Base de Datos:** SQLite (para simplicidad en el MVP) o PostgreSQL (para escalabilidad futura) para metadatos y etiquetas.
*   **Procesamiento de Imágenes/Embeddings:** OpenCV, Pillow, TensorFlow / PyTorch (usando modelos pre-entrenados como ResNet o EfficientNet).
*   **Búsqueda de Similitud:** Faiss (Facebook AI Similarity Search) o una implementación básica de búsqueda de vecinos más cercanos.

## 6. Alcance (Lo que NO estará en el MVP)

*   Autenticación de usuarios y roles.
*   Gestión de múltiples proyectos o conjuntos de datos complejos.
*   Etiquetado automático o sugerencias de etiquetas basadas en IA (más allá de la búsqueda de similitud).
*   Herramientas avanzadas de anotación (bounding boxes, segmentación).
*   Integración directa con plataformas de entrenamiento de ML (ej. SageMaker, Google AI Platform).
*   Optimización de rendimiento para millones de imágenes.
*   Despliegue en la nube robusto y escalable.

## 7. Criterios de Éxito del MVP

*   Los usuarios pueden cargar un directorio de imágenes y visualizarlas correctamente.
*   Los usuarios pueden etiquetar imágenes individualmente y estas etiquetas se persisten.
*   Los usuarios pueden filtrar imágenes por etiquetas.
*   La funcionalidad de búsqueda de similitud identifica y muestra imágenes relacionadas de manera coherente.
*   Los usuarios pueden exportar un archivo que vincule las imágenes con sus etiquetas.
*   Retroalimentación positiva de los usuarios sobre la utilidad de las funcionalidades principales para preparar conjuntos de datos.

## 8. Próximos Pasos (Después del MVP)

*   Recopilar feedback de usuarios.
*   Integrar etiquetado asistido por IA (sugerencias de etiquetas).
*   Herramientas de anotación (bounding boxes, segmentación).
*   Gestión de conjuntos de datos y proyectos.
*   Optimización de rendimiento.
*   Despliegue en la nube.
```