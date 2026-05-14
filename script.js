// Archivo JavaScript principal para interacciones
const initApp = () => {
    // 1. Manejo del Header Transparente a Sólido al hacer scroll
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Actualizar el año en el footer dinámicamente
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Lógica para el modo Claro/Oscuro (Light/Dark Theme)
    const setupThemeToggle = () => {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        
        // Revisar si ya había un tema guardado en el navegador
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            let theme = 'dark';
            if (document.body.classList.contains('light-theme')) {
                theme = 'light';
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            localStorage.setItem('theme', theme);
        });
    };
    setupThemeToggle();

    // 3. Inicialización del componente de Rive (Animación)
    // Utilizamos el CDN de Rive que ya está incluido en index.html
    const canvas = document.getElementById('riveCanvas');
    
    if (canvas && typeof rive !== 'undefined') {
        // Inicializamos una animación de ejemplo pública de Rive
        // En un proyecto real, reemplaza el 'src' con tu archivo .riv local (ej: './mi-animacion.riv')
        const riveInstance = new rive.Rive({
            src: 'https://cdn.rive.app/animations/vehicles.riv',
            canvas: canvas,
            autoplay: true,
            stateMachines: 'bumpy', // Máquina de estados de la animación de ejemplo
            onLoad: () => {
                // Previene que la animación se vea borrosa en pantallas de alta densidad (Retina)
                riveInstance.resizeDrawingSurfaceToCanvas();
            }
        });

        // Hacemos que el canvas sea responsivo
        window.addEventListener('resize', () => {
            if (riveInstance) {
                riveInstance.resizeDrawingSurfaceToCanvas();
            }
        });
    }

    // 4. Animación suave para anclas (Scroll Smooth)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Intersection Observer para revelar elementos al hacer scroll (Efecto Reveal)
    const revealElements = document.querySelectorAll('.glass-card, .section-header');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                // Al entrar en la vista, se añade una animación CSS
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Ocultar elementos inicialmente para la animación de revelado
    revealElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        revealOnScroll.observe(el);
    });

    // 6. El modelo 3D ahora se maneja automáticamente a través del componente web <model-viewer> en el index.html
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
