    var modal = document.getElementById("modalCV");
    var btn = document.getElementById("btn-cv");
    var span = document.getElementsByClassName("close-btn")[0];
    var btnProyectos = document.getElementById("btn-ir-proyectos");

    if (btn) {
        btn.onclick = function(event) {
            event.preventDefault();
            modal.style.display = "block";
        }
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    btnProyectos.onclick = function() {
        modal.style.display = "none";
        window.location.href = "#proyectos";
    }