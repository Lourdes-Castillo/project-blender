// Archivo JavaScript principal para interacciones

// --- SISTEMA DE PARTÍCULAS (FONDO INTERACTIVO) ---
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            // Usar el color de acento celeste
            ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        // Limitar la cantidad para asegurar buen rendimiento en móviles
        let numParticles = Math.floor(window.innerWidth / 20);
        if (numParticles > 80) numParticles = 80;
        
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }
    createParticles();

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Dibujar conexiones
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    // Usar el color de acento morado para las líneas de conexión
                    ctx.strokeStyle = `rgba(138, 43, 226, ${0.2 - dist / 120 * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

const initApp = () => {
    // Inicializar partículas de fondo
    initParticles();

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

    // 6. Carga Inteligente del Modelo 3D (Previene crasheos en móviles y optimiza rendimiento)
    const modelViewer = document.getElementById('my-model');
    if (modelViewer) {
        if (window.location.protocol === 'file:') {
            // Modo Local: Evita el error CORS cargando el archivo Base64 dinámicamente
            const script = document.createElement('script');
            script.src = './assets/modelData.js';
            script.onload = () => {
                if (typeof modelData !== 'undefined') {
                    // Convertir el Base64 a un Blob URL para evitar límites de tamaño de URI en móviles
                    try {
                        const b64Data = modelData.split(',')[1];
                        const byteString = atob(b64Data);
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        const blob = new Blob([ab], { type: 'model/gltf-binary' });
                        modelViewer.src = URL.createObjectURL(blob);
                    } catch(e) {
                        modelViewer.src = modelData; // Fallback
                    }
                }
            };
            document.body.appendChild(script);
        } else {
            // Modo Servidor / Móvil (GitHub Pages, localhost): Carga el .glb directo y ahorra muchísima memoria
            modelViewer.src = './assets/Statup.glb';
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
