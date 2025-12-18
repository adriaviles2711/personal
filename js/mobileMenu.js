document.addEventListener("DOMContentLoaded", () => {
    // 1. Capturamos los nuevos elementos por sus IDs corregidos
    const btnOpen = document.getElementById("mobile-menu");
    const btnClose = document.getElementById("mobile-menu-close");
    const navLinks = document.getElementById("secciones");
    const overlay = document.getElementById("overlay");
    const links = document.querySelectorAll("#secciones ul a");

    // 2. Función para abrir el menú
    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            navLinks.classList.add("active");
            overlay.classList.add("active");
            // Bloqueamos el scroll del cuerpo para que no se mueva al navegar por el menú
            document.body.style.overflow = "hidden";
        });
    }

    // 3. Función para cerrar el menú
    const closeMenu = () => {
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
        // Devolvemos el scroll al cuerpo
        document.body.style.overflow = "auto";
    };

    // Asignamos el cierre a la X, al overlay (capa oscura) y a los enlaces
    if (btnClose) btnClose.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    links.forEach(link => {
        link.addEventListener("click", closeMenu);
    });
});