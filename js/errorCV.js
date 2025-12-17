// Obtenemos los elementos
    var modal = document.getElementById("modalCV");
    var btn = document.getElementById("btn-cv"); // Tu botón de descarga
    var span = document.getElementsByClassName("close-btn")[0];
    var btnProyectos = document.getElementById("btn-ir-proyectos");

    // Cuando se hace clic en el botón "Descargar CV", abrimos el modal
    if (btn) {
        btn.onclick = function(event) {
            event.preventDefault(); // Evita que intente descargar o recargar
            modal.style.display = "block";
        }
    }

    // Cuando se hace clic en la "X", cerramos el modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Si hacen clic fuera del cuadro, también se cierra
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Botón "Ver Proyectos" dentro del modal
    btnProyectos.onclick = function() {
        modal.style.display = "none";
        window.location.href = "#proyectos";
    }