document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section, header");
    const navLinks = document.querySelectorAll("#secciones ul a");

    // Configuración del observador
    const observerOptions = {
        root: null,
        rootMargin: '-70px 0px 0px 0px',
        threshold: 0.50
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute("id");

                navLinks.forEach(link => {
                    link.removeAttribute("id");
                    
                    if (link.getAttribute("href") === `#${currentId}`) {
                        link.setAttribute("id", "active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});