// ============================================
// REGALO 3D CINEMATOGRÁFICO
// ============================================

let scene, camera, renderer, controls, composer, bloomPass;
let textoMesh, subtituloMesh;
let corazonParticles, corazonPosicionesFinales;
let anillos = [];
let flores = [];
let estrellas, estrellasFugaces = [];
let nebulosas = [];
let reloj;
let inicioTiempo;
let mouse = { x: 0, y: 0 };

// --- CONFIGURACIÓN ---
const CONFIG = {
    nombre: "Para Ti",
    subtitulo: "Con todo mi amor",
    fuenteURL: "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    colorCorazon: 0xff4d6d,
    colorTexto: 0xff4d6d,
    colorSubtitulo: 0xffd700,
    colorFlores: [0xff4d6d, 0xff8fab, 0xffc2d1, 0xffd700],
    bloomIntensidad: 1.5
};

// --- INICIALIZACIÓN ---
function init() {
    reloj = new THREE.Clock();
    inicioTiempo = 0;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 10, 400); // Empieza muy lejos

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.4;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 40;
    controls.maxDistance = 250;
    controls.autoRotate = false; // Lo activamos después de la intro
    controls.autoRotateSpeed = 0.3;
    controls.enabled = false; // Desactivar durante la intro

    // Post-procesamiento
    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomIntensidad, 0.8, 0.85
    );
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    configurarLuces();
    crearEstrellas();
    crearNebulosas();
    crearCorazon();
    crearAnillos();
    crearFlores();
    cargarFuenteYCrearTexto();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    animar();
}

// --- LUCES ---
function configurarLuces() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const l1 = new THREE.PointLight(CONFIG.colorCorazon, 3, 300);
    l1.position.set(30, 30, 50);
    scene.add(l1);
    
    const l2 = new THREE.PointLight(CONFIG.colorSubtitulo, 2, 300);
    l2.position.set(-30, -20, 40);
    scene.add(l2);
    
    const l3 = new THREE.PointLight(0x4d79ff, 1.5, 300);
    l3.position.set(0, 20, -60);
    scene.add(l3);
}

// --- CORAZÓN DE PARTÍCULAS (con intro) ---
function crearCorazon() {
    const total = 15000;
    const posicionesIniciales = new Float32Array(total * 3);
    const posicionesFinales = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);

    const colorRosa = new THREE.Color(CONFIG.colorCorazon);
    const colorBlanco = new THREE.Color(0xffffff);

    for (let i = 0; i < total; i++) {
        // --- POSICIÓN FINAL (forma de corazón) ---
        const t = Math.random() * Math.PI * 2;
        const grosor = 1 + (Math.random() - 0.5) * 0.5;
        const x2d = 16 * Math.pow(Math.sin(t), 3);
        const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 6 * grosor;
        const radio = 0.9 + Math.random() * 0.15;
        const factor = 1.4;

        posicionesFinales[i * 3] = x2d * factor * radio;
        posicionesFinales[i * 3 + 1] = y2d * factor * radio;
        posicionesFinales[i * 3 + 2] = z;

        // --- POSICIÓN INICIAL (dispersa por el universo) ---
        const distancia = 400 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        posicionesIniciales[i * 3] = distancia * Math.sin(phi) * Math.cos(theta);
        posicionesIniciales[i * 3 + 1] = distancia * Math.cos(phi);
        posicionesIniciales[i * 3 + 2] = distancia * Math.sin(phi) * Math.sin(theta);

        // --- COLORES ---
        const mix = colorRosa.clone().lerp(colorBlanco, Math.random() * 0.6);
        colores[i * 3] = mix.r;
        colores[i * 3 + 1] = mix.g;
        colores[i * 3 + 2] = mix.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posicionesIniciales, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    // Textura circular
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const material = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: new THREE.CanvasTexture(canvas)
    });

    corazonParticles = new THREE.Points(geometry, material);
    corazonPosicionesFinales = posicionesFinales;
    scene.add(corazonParticles);
}

// --- ANILLOS ORBITALES ---
function crearAnillos() {
    const coloresAnillo = [0xff4d6d, 0xffd700, 0xff8fab];
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.TorusGeometry(28 + i * 6, 0.15, 16, 200);
        const material = new THREE.MeshBasicMaterial({
            color: coloresAnillo[i],
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const anillo = new THREE.Mesh(geometry, material);
        anillo.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        anillo.rotation.y = (Math.random() - 0.5) * 0.8;
        anillo.userData = {
            velX: (Math.random() - 0.5) * 0.003,
            velY: 0.002 + Math.random() * 0.003,
            velZ: (Math.random() - 0.5) * 0.003
        };
        scene.add(anillo);
        anillos.push(anillo);
    }
}

// --- FLORES 3D ---
function crearFlores() {
    for (let i = 0; i < 100; i++) {
        const tamano = 0.3 + Math.random() * 0.9;
        const geometry = new THREE.SphereGeometry(tamano, 16, 16);
        const colorBase = CONFIG.colorFlores[Math.floor(Math.random() * CONFIG.colorFlores.length)];
        const material = new THREE.MeshStandardMaterial({
            color: colorBase,
            emissive: colorBase,
            emissiveIntensity: 1,
            metalness: 0.4,
            roughness: 0.3
        });
        const esfera = new THREE.Mesh(geometry, material);

        const radio = 50 + Math.random() * 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        esfera.position.x = radio * Math.sin(phi) * Math.cos(theta);
        esfera.position.y = radio * Math.cos(phi) * 0.6;
        esfera.position.z = radio * Math.sin(phi) * Math.sin(theta);

        esfera.userData = {
            radio, theta, phi,
            velocidad: 0.0005 + Math.random() * 0.0015,
            offsetY: Math.random() * Math.PI * 2,
            velocidadY: 0.3 + Math.random() * 0.6,
            baseY: esfera.position.y,
            escalaBase: tamano
        };
        scene.add(esfera);
        flores.push(esfera);
    }
}

// --- ESTRELLAS ---
function crearEstrellas() {
    const cantidad = 6000;
    const geometry = new THREE.BufferGeometry();
    const posiciones = new Float32Array(cantidad * 3);
    const colores = new Float32Array(cantidad * 3);
    const paleta = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xffd700),
        new THREE.Color(0xffb3c6),
        new THREE.Color(0x99ccff)
    ];
    for (let i = 0; i < cantidad; i++) {
        posiciones[i * 3] = (Math.random() - 0.5) * 2000;
        posiciones[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        posiciones[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        const c = paleta[Math.floor(Math.random() * paleta.length)];
        colores[i * 3] = c.r; colores[i * 3 + 1] = c.g; colores[i * 3 + 2] = c.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colores, 3));
    const material = new THREE.PointsMaterial({
        size: 0.8, vertexColors: true,
        transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    estrellas = new THREE.Points(geometry, material);
    scene.add(estrellas);
}

// --- NEBULOSAS ---
function crearNebulosas() {
    const coloresN = [0x6a00ff, 0xff00aa, 0xff4d6d, 0xffd700];
    for (let n = 0; n < 4; n++) {
        const cantidad = 1000;
        const geometry = new THREE.BufferGeometry();
        const posiciones = new Float32Array(cantidad * 3);
        const colorBase = new THREE.Color(coloresN[n]);
        const cx = (Math.random() - 0.5) * 400;
        const cy = (Math.random() - 0.5) * 200;
        const cz = (Math.random() - 0.5) * 400;
        for (let i = 0; i < cantidad; i++) {
            posiciones[i * 3] = cx + (Math.random() - 0.5) * 80;
            posiciones[i * 3 + 1] = cy + (Math.random() - 0.5) * 80;
            posiciones[i * 3 + 2] = cz + (Math.random() - 0.5) * 80;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
        const material = new THREE.PointsMaterial({
            color: colorBase, size: 2,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        scene.add(new THREE.Points(geometry, material));
        nebulosas.push(scene.children[scene.children.length - 1]);
    }
}

// --- ESTRELLAS FUGACES ---
function crearEstrellaFugaz() {
    const geometry = new THREE.BufferGeometry();
    const posiciones = new Float32Array(2 * 3); // Estela de 2 puntos
    // Punto de inicio aleatorio en el espacio
    const startX = (Math.random() - 0.5) * 800;
    const startY = 200 + Math.random() * 100;
    const startZ = (Math.random() - 0.5) * 800;
    const dirX = (Math.random() - 0.5) * 200;
    const dirY = -300 - Math.random() * 200;
    const dirZ = (Math.random() - 0.5) * 200;
    
    posiciones[0] = startX; posiciones[1] = startY; posiciones[2] = startZ;
    posiciones[3] = startX - dirX * 0.15; posiciones[4] = startY - dirY * 0.15; posiciones[5] = startZ - dirZ * 0.15;

    geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    const linea = new THREE.Line(geometry, material);
    linea.userData = {
        dir: new THREE.Vector3(dirX, dirY, dirZ),
        vida: 0,
        vidaMax: 2
    };
    scene.add(linea);
    estrellasFugaces.push(linea);
}

// --- CARGAR TEXTO ---
function cargarFuenteYCrearTexto() {
    const fontLoader = new THREE.FontLoader();
    fontLoader.load(CONFIG.fuenteURL, (font) => {
        // Principal
        const geoP = new THREE.TextGeometry(CONFIG.nombre, {
            font, size: 5, height: 1,
            curveSegments: 16,
            bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.08, bevelSegments: 6
        });
        geoP.center();
        const matP = new THREE.MeshPhysicalMaterial({
            color: CONFIG.colorTexto, metalness: 0.7, roughness: 0.15,
            clearcoat: 1, clearcoatRoughness: 0.05,
            emissive: CONFIG.colorTexto, emissiveIntensity: 0.7
        });
        textoMesh = new THREE.Mesh(geoP, matP);
        textoMesh.position.set(0, 45, 0);
        textoMesh.scale.set(0.01, 0.01, 0.01); // Empieza invisible
        scene.add(textoMesh);

        // Subtítulo
        const geoSub = new THREE.TextGeometry(CONFIG.subtitulo, {
            font, size: 1.6, height: 0.6,
            curveSegments: 12,
            bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.04, bevelSegments: 4
        });
        geoSub.center();
        const matSub = new THREE.MeshPhysicalMaterial({
            color: CONFIG.colorSubtitulo, metalness: 0.9, roughness: 0.1,
            clearcoat: 1, emissive: CONFIG.colorSubtitulo, emissiveIntensity: 0.8
        });
        subtituloMesh = new THREE.Mesh(geoSub, matSub);
        subtituloMesh.position.set(0, 36, 0);
        subtituloMesh.scale.set(0.01, 0.01, 0.01);
        scene.add(subtituloMesh);
    });
}

// --- RATÓN ---
function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

// --- EASING FUNCTIONS ---
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// --- ANIMACIÓN ---
function animar() {
    requestAnimationFrame(animar);
    const tiempo = reloj.getElapsedTime();
    const delta = reloj.getDelta();

    // ===== FASE 1: PARTÍCULAS SE JUNTAN (0s a 5s) =====
    if (corazonParticles) {
        const progreso = Math.min(tiempo / 5, 1);
        const factor = easeInOutCubic(progreso);
        
        const posiciones = corazonParticles.geometry.attributes.position.array;
        const posicionesIni = posiciones; // Ya son las iniciales
        // Interpolar hacia las finales
        for (let i = 0; i < posicionesIni.length; i++) {
            // Solo interpolamos si aún no ha terminado
            if (progreso < 1) {
                const ini = posicionesIni[i];
                const fin = corazonPosicionesFinales[i];
                // Guardar la posición inicial original en la primera iteración
                if (!corazonParticles.userData.original) {
                    corazonParticles.userData.original = new Float32Array(posicionesIni);
                }
                const orig = corazonParticles.userData.original[i];
                posiciones[i] = orig + (fin - orig) * factor;
            } else {
                posiciones[i] = corazonPosicionesFinales[i];
            }
        }
        corazonParticles.geometry.attributes.position.needsUpdate = true;
    }

    // ===== FASE 2: CÁMARA VUELA HACIA EL CORAZÓN (1s a 6s) =====
    if (tiempo < 7 && !controls.enabled) {
        const progreso = Math.min(Math.max((tiempo - 1) / 5, 0), 1);
        const factor = easeOutExpo(progreso);
        camera.position.z = 400 - 400 * factor + 70 * factor; // 400 -> 70
        camera.position.y = 10 + 15 * factor;
        camera.lookAt(0, 5, 0);
        
        if (progreso >= 1) {
            controls.enabled = true;
            controls.autoRotate = true;
            document.getElementById('instruccion').classList.add('visible');
        }
    }

    // ===== FASE 3: TEXTO APARECE (4s en adelante) =====
    if (tiempo > 4) {
        const progreso = Math.min((tiempo - 4) / 1.5, 1);
        const factor = easeOutExpo(progreso);
        if (textoMesh) {
            textoMesh.scale.set(factor, factor, factor);
            textoMesh.position.y = 45 + Math.sin(tiempo * 0.8) * 0.8;
        }
    }
    if (tiempo > 5) {
        const progreso = Math.min((tiempo - 5) / 1.5, 1);
        const factor = easeOutExpo(progreso);
        if (subtituloMesh) {
            subtituloMesh.scale.set(factor, factor, factor);
            subtituloMesh.position.y = 36 + Math.sin(tiempo * 0.8 + 0.5) * 0.6;
        }
    }

    // ===== LATIDO DEL CORAZÓN CON BLOOM =====
    if (tiempo > 4) {
        // Latido tipo "lub-dub"
        const t = tiempo * 1.5;
        const beat = Math.pow(Math.sin(t), 8) + 0.7 * Math.pow(Math.sin(t - 0.15), 8);
        const escala = 1 + beat * 0.06;
        corazonParticles.scale.set(escala, escala, escala);
        
        // El bloom late con el corazón
        if (bloomPass) {
            bloomPass.strength = CONFIG.bloomIntensidad + beat * 0.8;
        }
        
        // Ligera rotación
        corazonParticles.rotation.y = Math.sin(tiempo * 0.3) * 0.12;
    }

    // ===== ANILLOS ORBITALES =====
    anillos.forEach(a => {
        a.rotation.x += a.userData.velX;
        a.rotation.y += a.userData.velY;
        a.rotation.z += a.userData.velZ;
    });

    // ===== FLORES ORBITANDO =====
    flores.forEach((flor, i) => {
        const d = flor.userData;
        d.theta += d.velocidad;
        flor.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        flor.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        flor.position.y = d.baseY + Math.sin(tiempo * d.velocidadY + d.offsetY) * 3;
        
        // Respiración (escala)
        const resp = 1 + Math.sin(tiempo * 2 + i) * 0.15;
        flor.scale.set(resp, resp, resp);
    });

    // ===== ESTRELLAS Y NEBULOSAS =====
    if (estrellas) {
        estrellas.rotation.y += 0.0002;
        estrellas.rotation.x += 0.0001;
    }
    nebulosas.forEach((n, i) => {
        if (n) n.rotation.y += 0.0003 * (i + 1);
    });

    // ===== ESTRELLAS FUGACES =====
    // Crear una nueva cada 2.5 segundos
    if (tiempo > 3 && Math.random() < 0.015) {
        crearEstrellaFugaz();
    }
    // Actualizar las existentes
    for (let i = estrellasFugaces.length - 1; i >= 0; i--) {
        const ef = estrellasFugaces[i];
        ef.userData.vida += delta;
        const progreso = ef.userData.vida / ef.userData.vidaMax;
        
        // Mover
        const pos = ef.geometry.attributes.position.array;
        pos[0] += ef.userData.dir.x * delta;
        pos[1] += ef.userData.dir.y * delta;
        pos[2] += ef.userData.dir.z * delta;
        pos[3] += ef.userData.dir.x * delta;
        pos[4] += ef.userData.dir.y * delta;
        pos[5] += ef.userData.dir.z * delta;
        ef.geometry.attributes.position.needsUpdate = true;
        
        // Desvanecer
        ef.material.opacity = 1 - progreso;
        
        if (progreso >= 1) {
            scene.remove(ef);
            ef.geometry.dispose();
            ef.material.dispose();
            estrellasFugaces.splice(i, 1);
        }
    }

    // ===== PARALAJE SUAVE CON EL RATÓN =====
    if (controls.enabled) {
        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
        // No movemos Y porque controls.autoRotate ya maneja la órbita
    }

    controls.update();
    composer.render();
}

// --- RESIZE ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

init();
