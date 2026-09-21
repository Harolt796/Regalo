// ============================================
// REGALO 3D - UNIVERSO COMPLETO
// Corazón de partículas + Texto 3D + Flores 3D + Estrellas
// ============================================

let scene, camera, renderer, controls, composer;
let textoMesh, subtituloMesh;
let corazonParticles;
let flores = [];
let estrellas;
let nebulosas = [];
let reloj;

const loader = document.getElementById('loader');

// --- CONFIGURACIÓN PERSONALIZABLE ---
const CONFIG = {
    nombre: "Para Ti",
    subtitulo: "Con todo mi amor",
    fuenteURL: "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    colorCorazon: 0xff4d6d,
    colorTexto: 0xff4d6d,
    colorSubtitulo: 0xffd700,
    colorFlores: [0xff4d6d, 0xff8fab, 0xffc2d1, 0xffd700],
    bloomIntensidad: 1.2
};

// --- INICIALIZACIÓN ---
function init() {
    reloj = new THREE.Clock();

    // Escena
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.008);

    // Cámara
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.set(0, 5, 70);

    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controles orbitales
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.4;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 30;
    controls.maxDistance = 150;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // Post-procesamiento (Bloom = brillo real)
    configurarBloom();

    // Luces
    configurarLuces();

    // Crear elementos 3D
    crearEstrellas();
    crearNebulosas();
    crearCorazon();
    crearFlores();
    cargarFuenteYCrearTexto();

    // Eventos
    window.addEventListener('resize', onWindowResize);

    // Animar
    animar();
}

// --- BLOOM (BRILLO REAL 3D) ---
function configurarBloom() {
    const renderScene = new THREE.RenderPass(scene, camera);
    
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomIntensidad,  // Intensidad
        0.6,                     // Radio
        0.85                     // Umbral
    );

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
}

// --- LUCES ---
function configurarLuces() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const luzRosa = new THREE.PointLight(CONFIG.colorCorazon, 3, 200);
    luzRosa.position.set(20, 20, 30);
    scene.add(luzRosa);

    const luzDorada = new THREE.PointLight(CONFIG.colorSubtitulo, 2, 200);
    luzDorada.position.set(-20, -15, 25);
    scene.add(luzDorada);

    const luzAzul = new THREE.PointLight(0x4d79ff, 1.5, 200);
    luzAzul.position.set(0, 10, -40);
    scene.add(luzAzul);
}

// --- CORAZÓN DE PARTÍCULAS 3D ---
function crearCorazon() {
    const totalParticulas = 12000;
    const posiciones = new Float32Array(totalParticulas * 3);
    const colores = new Float32Array(totalParticulas * 3);

    const colorRosa = new THREE.Color(CONFIG.colorCorazon);
    const colorBlanco = new THREE.Color(0xffffff);

    for (let i = 0; i < totalParticulas; i++) {
        // Ecuación paramétrica del corazón en 3D
        const t = Math.random() * Math.PI * 2;

        // Grosor variable (para que el corazón tenga cuerpo 3D)
        const grosor = 1 + (Math.random() - 0.5) * 0.4;

        // Forma de corazón 2D
        const x2d = 16 * Math.pow(Math.sin(t), 3);
        const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        // Añadir profundidad real 3D
        const z = (Math.random() - 0.5) * 6 * grosor;
        
        // Escala y pequeña variación radial
        const radio = 0.9 + Math.random() * 0.15;
        const factor = 1.4;

        posiciones[i * 3] = x2d * factor * radio;
        posiciones[i * 3 + 1] = y2d * factor * radio;
        posiciones[i * 3 + 2] = z;

        // Colores mezclados (rosa + blanco)
        const mixColor = colorRosa.clone().lerp(colorBlanco, Math.random() * 0.6);
        colores[i * 3] = mixColor.r;
        colores[i * 3 + 1] = mixColor.g;
        colores[i * 3 + 2] = mixColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    // Textura circular para las partículas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texturaParticula = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: texturaParticula
    });

    corazonParticles = new THREE.Points(geometry, material);
    scene.add(corazonParticles);
}

// --- FLORES 3D (Esferas brillantes) ---
function crearFlores() {
    const cantidadFlores = 80;

    for (let i = 0; i < cantidadFlores; i++) {
        const tamano = 0.3 + Math.random() * 0.7;
        const geometry = new THREE.SphereGeometry(tamano, 16, 16);

        const colorBase = CONFIG.colorFlores[Math.floor(Math.random() * CONFIG.colorFlores.length)];
        const material = new THREE.MeshStandardMaterial({
            color: colorBase,
            emissive: colorBase,
            emissiveIntensity: 0.8,
            metalness: 0.3,
            roughness: 0.4
        });

        const esfera = new THREE.Mesh(geometry, material);

        // Distribuir en una esfera amplia alrededor del corazón
        const radio = 40 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        esfera.position.x = radio * Math.sin(phi) * Math.cos(theta);
        esfera.position.y = radio * Math.cos(phi) * 0.6;
        esfera.position.z = radio * Math.sin(phi) * Math.sin(theta);

        esfera.userData = {
            radio: radio,
            theta: theta,
            phi: phi,
            velocidad: 0.0008 + Math.random() * 0.002,
            offsetY: Math.random() * Math.PI * 2,
            velocidadY: 0.3 + Math.random() * 0.6,
            baseY: esfera.position.y
        };

        scene.add(esfera);
        flores.push(esfera);
    }
}

// --- CAMPO DE ESTRELLAS 3D ---
function crearEstrellas() {
    const cantidadEstrellas = 5000;
    const geometry = new THREE.BufferGeometry();
    const posiciones = new Float32Array(cantidadEstrellas * 3);
    const colores = new Float32Array(cantidadEstrellas * 3);

    const paleta = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xffd700),
        new THREE.Color(0xffb3c6),
        new THREE.Color(0x99ccff)
    ];

    for (let i = 0; i < cantidadEstrellas; i++) {
        posiciones[i * 3] = (Math.random() - 0.5) * 1500;
        posiciones[i * 3 + 1] = (Math.random() - 0.5) * 1500;
        posiciones[i * 3 + 2] = (Math.random() - 0.5) * 1500;

        const color = paleta[Math.floor(Math.random() * paleta.length)];
        colores[i * 3] = color.r;
        colores[i * 3 + 1] = color.g;
        colores[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    estrellas = new THREE.Points(geometry, material);
    scene.add(estrellas);
}

// --- NEBULOSAS 3D (Partículas de colores) ---
function crearNebulosas() {
    const coloresNebulosa = [0x6a00ff, 0xff00aa, 0xff4d6d, 0xffd700];
    
    for (let n = 0; n < 4; n++) {
        const cantidad = 800;
        const geometry = new THREE.BufferGeometry();
        const posiciones = new Float32Array(cantidad * 3);
        const colorBase = new THREE.Color(coloresNebulosa[n]);

        // Centro de la nebulosa
        const centroX = (Math.random() - 0.5) * 200;
        const centroY = (Math.random() - 0.5) * 100;
        const centroZ = (Math.random() - 0.5) * 200;

        for (let i = 0; i < cantidad; i++) {
            posiciones[i * 3] = centroX + (Math.random() - 0.5) * 40;
            posiciones[i * 3 + 1] = centroY + (Math.random() - 0.5) * 40;
            posiciones[i * 3 + 2] = centroZ + (Math.random() - 0.5) * 40;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));

        const material = new THREE.PointsMaterial({
            color: colorBase,
            size: 1.5,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const nebulosa = new THREE.Points(geometry, material);
        scene.add(nebulosa);
        nebulosas.push(nebulosa);
    }
}

// --- CARGAR TEXTO 3D ---
function cargarFuenteYCrearTexto() {
    const fontLoader = new THREE.FontLoader();

    fontLoader.load(CONFIG.fuenteURL, (font) => {
        // Texto principal
        const geoPrincipal = new THREE.TextGeometry(CONFIG.nombre, {
            font: font,
            size: 4,
            height: 1,
            curveSegments: 16,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.08,
            bevelOffset: 0,
            bevelSegments: 6
        });
        geoPrincipal.center();

        const matPrincipal = new THREE.MeshPhysicalMaterial({
            color: CONFIG.colorTexto,
            metalness: 0.7,
            roughness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            emissive: CONFIG.colorTexto,
            emissiveIntensity: 0.6
        });

        textoMesh = new THREE.Mesh(geoPrincipal, matPrincipal);
        textoMesh.position.set(0, 30, 0);
        scene.add(textoMesh);

        // Subtítulo
        if (CONFIG.subtitulo && CONFIG.subtitulo.trim() !== "") {
            const geoSub = new THREE.TextGeometry(CONFIG.subtitulo, {
                font: font,
                size: 1.4,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.08,
                bevelSize: 0.04,
                bevelSegments: 4
            });
            geoSub.center();

            const matSub = new THREE.MeshPhysicalMaterial({
                color: CONFIG.colorSubtitulo,
                metalness: 0.9,
                roughness: 0.1,
                clearcoat: 1,
                emissive: CONFIG.colorSubtitulo,
                emissiveIntensity: 0.7
            });

            subtituloMesh = new THREE.Mesh(geoSub, matSub);
            subtituloMesh.position.set(0, 23, 0);
            scene.add(subtituloMesh);
        }

        // Ocultar pantalla de carga
        loader.classList.add('oculto');

    }, undefined, (error) => {
        console.error("Error al cargar fuente:", error);
        loader.innerHTML = "<p style='color:red'>Error al cargar. Revisa tu conexión.</p>";
    });
}

// --- ANIMACIÓN ---
function animar() {
    requestAnimationFrame(animar);

    const tiempo = reloj.getElapsedTime();

    // Latido del corazón
    if (corazonParticles) {
        const latido = 1 + Math.sin(tiempo * 2.5) * 0.04;
        corazonParticles.scale.set(latido, latido, latido);
        corazonParticles.rotation.y = Math.sin(tiempo * 0.2) * 0.15;
    }

    // Textos flotando
    if (textoMesh) {
        textoMesh.position.y = 30 + Math.sin(tiempo * 0.8) * 0.5;
    }
    if (subtituloMesh) {
        subtituloMesh.position.y = 23 + Math.sin(tiempo * 0.8 + 0.5) * 0.4;
    }

    // Flores orbitando
    flores.forEach((flor) => {
        const d = flor.userData;
        d.theta += d.velocidad;
        
        flor.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        flor.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        flor.position.y = d.baseY + Math.sin(tiempo * d.velocidadY + d.offsetY) * 2;
    });

    // Estrellas girando lentamente
    if (estrellas) {
        estrellas.rotation.y += 0.0002;
        estrellas.rotation.x += 0.0001;
    }

    // Nebulosas girando
    nebulosas.forEach((n, i) => {
        n.rotation.y += 0.0003 * (i + 1);
    });

    controls.update();
    composer.render();
}

// --- REDIMENSIONAR ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// --- INICIAR ---
init();
