// --- CONFIGURACIÓN ---
const githubUser = 'adriaviles2711';
const githubRepo = 'personal';
const docsFolder = 'docs';
const mainBranch = 'main'; // Asegúrate de que tu rama principal se llame 'main' (o cámbialo a 'master')
const MODO_LOCAL = false;

// Archivos para modo local (necesario porque no podemos listar carpetas en local)
const archivosLocales = [
    { name: "DOCUMENTACION_TECNICA.md", download_url: "docs/DashboardServidor/DOCUMENTACION_TECNICA.md" },
];

const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${docsFolder}`;

// Elementos del DOM
const menuContainer = document.getElementById('docs-menu');
const contentContainer = document.getElementById('markdown-render');
let observer = null; // Para el Scroll Spy

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de Marked (Markdown) + Highlight.js (Código)
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-',
    });

    // Añadimos clase al menú
    menuContainer.classList.add('doc-submenu');
    
    // 2. Crear el visor de imágenes (Lightbox) en el cuerpo de la página
    createZoomOverlay();

    // 3. Iniciar la carga de documentación
    initDocs();
});

// --- LÓGICA DEL VISOR DE IMÁGENES (LIGHTBOX) ---
function createZoomOverlay() {
    if (document.getElementById('zoom-overlay')) return;

    // Crear contenedor oscuro
    const overlay = document.createElement('div');
    overlay.id = 'zoom-overlay';
    
    // Crear la imagen grande
    const zoomImg = document.createElement('img');
    zoomImg.id = 'zoom-image';
    
    overlay.appendChild(zoomImg);
    document.body.appendChild(overlay);
    
    // Función para cerrar
    const closeZoom = () => {
        overlay.classList.remove('active'); // Quita la animación
        setTimeout(() => {
            overlay.style.display = 'none';
            zoomImg.src = ''; // Limpia la fuente
        }, 300);
    };

    // Cerrar con click o tecla Escape
    overlay.addEventListener('click', closeZoom);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeZoom();
    });
}

function openLightbox(src) {
    const overlay = document.getElementById('zoom-overlay');
    const zoomImg = document.getElementById('zoom-image');
    
    zoomImg.src = src;
    overlay.style.display = 'flex'; // Primero lo mostramos (invisible)
    
    // Pequeña pausa para que el navegador procese el display:flex antes de animar
    requestAnimationFrame(() => {
        overlay.classList.add('active'); // Activamos la opacidad y el zoom
    });
}

// --- LÓGICA DE CARGA DE DOCUMENTACIÓN ---
async function initDocs() {
    try {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view'); // Ejemplo: 'DashboardServidores/DOCUMENTACION_TECNICA'

        // CASO 1: Si hay un parámetro 'view' en la URL (Carga directa)
        if (viewParam) {
            let directUrl;
            
            if (MODO_LOCAL) {
                // En local buscamos en el array manual
                const localFile = archivosLocales.find(f => f.download_url.includes(viewParam));
                if (localFile) directUrl = localFile.download_url;
                else throw new Error("Archivo local no configurado en la lista 'archivosLocales'");
            } else {
                // En producción construimos la URL raw de GitHub
                // Estructura: https://raw.githubusercontent.com/USUARIO/REPO/RAMA/CARPETA_DOCS/RUTA_ARCHIVO.md
                directUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${mainBranch}/${docsFolder}/${viewParam}.md`;
            }

            await loadMdContent(directUrl);
            return;
        }

        // CASO 2: Si NO hay parámetro, cargamos la lista por defecto de la raíz
        let data;
        if (MODO_LOCAL) {
            data = archivosLocales;
        } else {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Error GitHub API (Límite excedido o ruta incorrecta)");
            data = await response.json();
        }

        // Filtramos solo archivos .md
        const mdFiles = Array.isArray(data) ? data.filter(item => item.name.endsWith('.md')) : [];
        
        if (mdFiles.length > 0) {
            // Cargar el primero por defecto
            loadMdContent(mdFiles[0].download_url);
        } else {
            contentContainer.innerHTML = '<h3>No se encontró documentación en la raíz.</h3>';
        }

    } catch (error) {
        console.error(error);
        contentContainer.innerHTML = `<h3 class="error">⚠️ Error: ${error.message}</h3>`;
    }
}

async function loadMdContent(url) {
    contentContainer.style.opacity = '0.5';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error al descargar el archivo (${response.status})`);
        const mdText = await response.text();
        
        // 1. Renderizar HTML desde Markdown
        contentContainer.innerHTML = marked.parse(mdText);
        contentContainer.style.opacity = '1';

        // --- ARREGLAR RUTAS DE IMÁGENES RELATIVAS ---
        // Obtenemos la carpeta base del archivo MD actual
        const basePath = url.substring(0, url.lastIndexOf('/') + 1);

        const rawImages = contentContainer.querySelectorAll('img');
        rawImages.forEach(img => {
            const src = img.getAttribute('src');
            // Si la ruta es relativa (no empieza por http ni por /)
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
                const cleanSrc = src.replace(/^\.\//, '');
                img.src = basePath + cleanSrc;
            }
        });

        // 2. Colorear bloques de código
        document.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
        });

        // 3. PROCESAR IMÁGENES (Estilo Tarjeta + Click)
        const images = contentContainer.querySelectorAll('img');
        images.forEach(img => {
            const wrapper = document.createElement('figure');
            wrapper.className = 'image-card';
            
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            wrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(img.src);
            });
        });

        // 4. Generar Índice Lateral y activar Scroll Spy
        generatePageTOC();

    } catch (error) {
        console.error(error);
        contentContainer.innerHTML = `<h2>Error al cargar el documento</h2><p>${error.message}</p>`;
        contentContainer.style.opacity = '1';
    }
}

// --- LÓGICA DEL MENÚ LATERAL (TABLA DE CONTENIDOS) ---
function generatePageTOC() {
    menuContainer.innerHTML = '';
    
    // Buscamos títulos H2 y H3 dentro del contenido renderizado
    const headers = contentContainer.querySelectorAll('h2, h3');
    
    if (headers.length === 0) {
        menuContainer.innerHTML = '<li style="padding:10px; color:var(--text-muted)">Sin índice</li>';
        return;
    }

    // Crear enlaces en el menú
    headers.forEach((header, index) => {
        const id = header.id || `section-${index}`;
        header.id = id;

        const li = document.createElement('li');
        li.className = header.tagName.toLowerCase(); // 'h2' o 'h3'
        li.dataset.target = id; // Para saber cuál iluminar

        const a = document.createElement('a');
        a.textContent = header.textContent;
        a.href = `#${id}`;
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, null, `#${id}`);
        });

        li.appendChild(a);
        menuContainer.appendChild(li);
    });

    // Iniciar el observador de scroll
    initScrollSpy(headers);
}

function initScrollSpy(headers) {
    if (observer) observer.disconnect();

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80% 0px', // Se activa cuando el título está cerca de arriba
        threshold: 0
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Quitar clase active de todos
                document.querySelectorAll('#docs-menu li').forEach(li => li.classList.remove('active'));
                
                // Buscar el enlace correspondiente y activarlo
                const activeId = entry.target.id;
                const activeLink = document.querySelector(`#docs-menu li[data-target="${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    headers.forEach(header => observer.observe(header));
}