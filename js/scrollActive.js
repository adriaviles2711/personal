document.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("header, section");
    const navLinks = document.querySelectorAll("#secciones ul a");

    let currentSectionId = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Detectamos si el scroll ha pasado el inicio de la sección (menos un margen de 100px)
        if (window.pageYOffset >= sectionTop - 100) {
            currentSectionId = section.getAttribute("id");
        }
    });

    // Refuerzo para el final de la página: si tocamos fondo, activar la última sección
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
        currentSectionId = "proyectos"; 
    }

    navLinks.forEach((link) => {
        link.removeAttribute("id");
        // Comparamos el href con el ID de la sección actual
        if (link.getAttribute("href") === `#${currentSectionId}`) {
            link.setAttribute("id", "active");
        }
    });
});