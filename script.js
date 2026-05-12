import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
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

    // 6. Configuración de Three.js y GLTFLoader para el Modelo de Blender
    const threeContainer = document.getElementById('three-container');
    if (threeContainer) {
        const scene = new THREE.Scene();
        
        // Crear cámara
        const camera = new THREE.PerspectiveCamera(45, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 100);
        camera.position.set(-1.5, 1.5, 3);
        
        // Crear renderer con fondo transparente y antialiasing
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        threeContainer.appendChild(renderer.domElement);

        // Controles de cámara (OrbitControls)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Rotación suave
        controls.dampingFactor = 0.05;
        controls.autoRotate = true; // Para que el modelo rote lentamente solo
        controls.autoRotateSpeed = 1.5;
        controls.enableZoom = true; // Hacer zoom con el scroll

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 1);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        // Cargar Modelo 3D (.glb) de ejemplo (Casco de KhronosGroup)
        // Puedes reemplazar esta URL con la ruta a tu propio archivo exportado de Blender (.glb o .gltf)
        const loader = new GLTFLoader();
        const modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

        loader.load(
            modelUrl,
            function (gltf) {
                // Modelo cargado exitosamente
                const model = gltf.scene;
                
                // Centrar modelo (opcional dependiendo del origen en Blender)
                model.position.set(0, 0, 0);
                scene.add(model);
                
                // Ocultar indicador de carga
                const loadingEl = document.getElementById('loading-model');
                if (loadingEl) loadingEl.style.display = 'none';
            },
            function (xhr) {
                // Progreso de carga
                const loadingEl = document.getElementById('loading-model');
                if (loadingEl) {
                    const percent = (xhr.loaded / xhr.total) * 100;
                    if (!isNaN(percent) && percent !== Infinity) {
                        loadingEl.textContent = `Cargando: ${Math.round(percent)}%`;
                    } else {
                        loadingEl.textContent = 'Cargando modelo...';
                    }
                }
            },
            function (error) {
                console.error('Error al cargar el modelo 3D:', error);
                const loadingEl = document.getElementById('loading-model');
                if (loadingEl) loadingEl.textContent = 'Error al cargar';
            }
        );

        // Bucle de animación (Render loop)
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // Necesario si enableDamping o autoRotate son true
            renderer.render(scene, camera);
        }
        animate();

        // Manejar redimensionamiento (Resize)
        window.addEventListener('resize', () => {
            if (threeContainer && threeContainer.clientWidth > 0) {
                camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
            }
        });
    }
});
