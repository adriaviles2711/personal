tsParticles.load("tsparticles", {
    fullScreen: {
        enable: false,
        zIndex: 1 // Asegura que respete el z-index de tu CSS
    },
    fpsLimit: 60,
    background: {
        color: "transparent"
    },
    particles: {
        number: {
            value: 120,
            density: { enable: true, area: 800 }
        },
        color: {
            value: "#ffffff"
        },
        shape: {
            type: "edge"
        },
        opacity: {
            value: 0.5
        },
        size: {
            value: 3
        },
        links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.5,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            outModes: { default: "bounce" }
        }
    },
    interactivity: {
        detectsOn: "window",
        events: {
            onHover: {
                enable: true,
                mode: ["grab", "bubble"]
            }
        },
        modes: {
            grab: {
                distance: 200,
                links: {
                    opacity: 1,
                    color: "#FF7B00"
                }
            },
            bubble: {
                distance: 200,
                size: 7,
                color: {
                    value: "#FF7B00"
                },
                opacity: 1
            }
        }
    },
    detectRetina: true
});