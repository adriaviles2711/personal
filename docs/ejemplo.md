# Guía de Inicio: Sistema de Documentación

Bienvenido a la documentación oficial. Esta página es una demostración técnica de cómo se renderizan los archivos `.md` utilizando **Marked.js** y los estilos personalizados del sistema.

> **Nota:** Este sistema carga los archivos dinámicamente sin recargar la página, ideal para portafolios de desarrolladores y documentación técnica.
## Instalación y Configuración

Para comenzar a utilizar este sistema en tu entorno local, asegúrate de tener la estructura de carpetas correcta. El sistema detecta automáticamente los títulos para generar el índice lateral.

### Estructura de Carpetas
El sistema espera encontrar la siguiente organización:

1. `index.html` (Landing page)
2. `docs.html` (Visor de documentación)
3. Carpeta `docs/` (Aquí van tus archivos .md)

### Ejemplo de Código
El sistema utiliza `Highlight.js` con el tema *Atom One Dark* para resaltar la sintaxis automáticamente.

```javascript
// Ejemplo de función para cargar documentos
async function loadDocument(filename) {
    try {
        const response = await fetch(`./docs/${filename}`);
        if (!response.ok) throw new Error("404 Not Found");
        
        const text = await response.text();
        return parseMarkdown(text);
    } catch (error) {
        console.error("Error al cargar:", error);
    }
}
```
## Elementos de Diseño

A continuación se muestra cómo se visualizan diferentes elementos HTML estándar dentro del visor.

### Tablas de Datos
Las tablas son responsivas y mantienen el esquema de colores del sitio.

| Componente | Estado | Versión |
| :--- | :--- | :--- |
| Core | ✅ Estable | v1.0.2 |
| UI Kit | ⚠️ Beta | v0.9.5 |
| API | ✅ Estable | v2.1.0 |

### Listas y Tipografía

Podemos anidar listas para organizar la información:

* **Frontend:**
    * HTML5 Semántico
    * CSS3 (Variables y Flexbox/Grid)
    * JavaScript ES6+
* **Backend:**
    * Node.js
    * Express

---

## Próximos Pasos

Si deseas agregar una nueva página a esta documentación:

1. Crea un archivo `.md` en la carpeta `docs`.
2. Asegúrate de añadirlo al array `archivosLocales` en `docs.js` si estás en modo local.
3. ¡Listo! El menú se actualizará automáticamente.

![Logo de Google](https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png)