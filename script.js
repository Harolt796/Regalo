// ============================================
// REGALO 3D - 5 DESAFÍOS PROGRESIVOS
// ============================================

let scene, camera, renderer, controls, composer, bloomPass;
let estrellas, nebulosas = [], nieblas = [], planetas = [], cristales = [], flores = [];
let fotoActual = null;
let reloj;
let mouse = { x: 0, y: 0 };
let raycaster = new THREE.Raycaster();
let mouseNDC = new THREE.Vector2();
let cameraShake = 0;
let tiempoEstado = 0;

// Estado del juego
let estadoActual = 'intro';
let indiceFotoActual = 0;
let objetivos = [];
let objetivosRestantes = 0;
let objetivosTotales = 0;
let bursts = [];

// Desafío final
let faseFinal = 0; // 0: corazones, 1: memorizar, 2: secuencia, 3: revelando
let codigoColores = [];
let secuenciaUsuario = [];
let esferasFinales = [];

const CONFIG = {
    colorCorazon: 0xff4d6d,
    colorDorado: 0xffd700,
    colorAzul: 0x4d79ff,
    bloomIntensidad: 0.7
};

// Textos personalizables
const HISTORIAS = [
    { titulo: "El día que te conocí", texto: "Desde ese momento algo cambió en mí. Tu sonrisa fue el comienzo de todo." },
    { titulo: "Nuestro primer momento", texto: "Cada segundo a tu lado se volvió un recuerdo que guardo con todo mi corazón." },
    { titulo: "Aventuras juntos", texto: "No importa el lugar, contigo todo se convierte en una historia bonita." },
    { titulo: "Momentos que atesoro", texto: "Gracias por cada risa, cada abrazo y cada instante compartido." },
    { titulo: "Y esto es solo el comienzo...", texto: "Te quiero más de lo que las palabras pueden decir. Feliz Día del Amor y la Amistad ❤️" }
];

const FOTOS = ["imagen-1.jpeg", "imagen-2.jpeg", "imagen-3.jpeg", "imagen-4.jpeg", "imagen-5.jpeg"];

// ============================================
// INICIALIZACIÓN
// ============================================
function init() {
    reloj = new THREE.Clock();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0025);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(0, 5, 60);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 40;
    controls.maxDistance = 100;
    controls.autoRotate = false;

    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomIntensidad, 0.5, 0.9
    );
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    configurarLuces();
    crearEstrellas();
    crearNebulosas();
    crearNiebla();
    crearPlanetas();
    crearCristalesAmbientales();
    crearFloresAmbientales();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);

    setTimeout(iniciarSecuencia, 2000);
    animar();
}

function configurarLuces() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const l1 = new THREE.PointLight(CONFIG.colorCorazon, 1.5, 400);
    l1.position.set(30, 30, 50);
    scene.add(l1);
    const l2 = new THREE.PointLight(CONFIG.colorDorado, 1, 400);
    l2.position.set(-30, -20, 40);
    scene.add(l2);
    const l3 = new THREE.PointLight(CONFIG.colorAzul, 1.2, 400);
    l3.position.set(0, 20, -60);
    scene.add(l3);
}

// ============================================
// AMBIENTE
// ============================================
function crearEstrellas() {
    const cantidad = 5000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cantidad * 3);
    const col = new Float32Array(cantidad * 3);
    const paleta = [new THREE.Color(0xffffff), new THREE.Color(0xffd700), new THREE.Color(0xffb3c6), new THREE.Color(0x99ccff)];
    for (let i = 0; i < cantidad; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2500;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2500;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2500;
        const c = paleta[Math.floor(Math.random() * paleta.length)];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
        size: 0.7, vertexColors: true, transparent: true,
        opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
    estrellas = new THREE.Points(geo, mat);
    scene.add(estrellas);
}

function crearNebulosas() {
    const coloresN = [0x6a00ff, 0xff00aa, 0xff4d6d, 0xffd700];
    for (let n = 0; n < 4; n++) {
        const cantidad = 700;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(cantidad * 3);
        const c = new THREE.Color(coloresN[n]);
        const cx = (Math.random() - 0.5) * 600;
        const cy = (Math.random() - 0.5) * 300;
        const cz = (Math.random() - 0.5) * 600;
        for (let i = 0; i < cantidad; i++) {
            pos[i * 3] = cx + (Math.random() - 0.5) * 120;
            pos[i * 3 + 1] = cy + (Math.random() - 0.5) * 120;
            pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 120;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: c, size: 2.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const neb = new THREE.Points(geo, mat);
        scene.add(neb);
        nebulosas.push(neb);
    }
}

function crearNiebla() {
    for (let n = 0; n < 5; n++) {
        const geo = new THREE.PlaneGeometry(250, 250);
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 100, 150, 0.25)');
        grad.addColorStop(0.5, 'rgba(150, 50, 200, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        const mat = new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(canvas),
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false, side: THREE.DoubleSide
        });
        const niebla = new THREE.Mesh(geo, mat);
        niebla.position.set((Math.random()-0.5)*500, (Math.random()-0.5)*250, (Math.random()-0.5)*500);
        niebla.rotation.z = Math.random() * Math.PI;
        niebla.userData = { rotVel: (Math.random() - 0.5) * 0.001, offset: Math.random() * 6 };
        scene.add(niebla);
        nieblas.push(niebla);
    }
}

function crearPlanetas() {
    const coloresP = [0x4d79ff, 0x9933ff, 0xff66aa, 0x33cc99, 0xffaa33];
    for (let i = 0; i < 5; i++) {
        const grupo = new THREE.Group();
        const tam = 6 + Math.random() * 12;
        const color = coloresP[i];
        const geo = new THREE.SphereGeometry(tam, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
            color: color, emissive: color, emissiveIntensity: 0.35,
            metalness: 0.5, roughness: 0.7
        });
        grupo.add(new THREE.Mesh(geo, mat));

        const atmGeo = new THREE.SphereGeometry(tam * 1.15, 24, 24);
        const atmMat = new THREE.MeshBasicMaterial({
            color: color, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, side: THREE.BackSide
        });
        grupo.add(new THREE.Mesh(atmGeo, atmMat));

        if (i % 2 === 0) {
            const aGeo = new THREE.TorusGeometry(tam * 1.7, 0.4, 12, 80);
            const aMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.25,
                blending: THREE.AdditiveBlending
            });
            const anillo = new THREE.Mesh(aGeo, aMat);
            anillo.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
            grupo.add(anillo);
        }

        const distancia = 400 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        grupo.position.set(distancia * Math.sin(phi) * Math.cos(theta), distancia * Math.cos(phi) * 0.4, distancia * Math.sin(phi) * Math.sin(theta));
        grupo.userData = {
            rotVel: (Math.random() - 0.5) * 0.004,
            orbVel: (Math.random() - 0.5) * 0.00015,
            orbR: distancia, orbT: theta, orbP: phi
        };
        scene.add(grupo);
        planetas.push(grupo);
    }
}

function crearCristalesAmbientales() {
    for (let i = 0; i < 30; i++) {
        const geo = new THREE.OctahedronGeometry(0.6 + Math.random() * 1.2, 0);
        const coloresC = [0xff4d6d, 0xffd700, 0x99ccff, 0xff8fab];
        const c = coloresC[Math.floor(Math.random() * coloresC.length)];
        const mat = new THREE.MeshPhysicalMaterial({
            color: c, emissive: c, emissiveIntensity: 0.5,
            metalness: 0.4, roughness: 0.1,
            transparent: true, opacity: 0.85, clearcoat: 1
        });
        const cristal = new THREE.Mesh(geo, mat);
        const radio = 40 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        cristal.position.set(radio * Math.sin(phi) * Math.cos(theta), radio * Math.cos(phi) * 0.7, radio * Math.sin(phi) * Math.sin(theta));
        cristal.userData = {
            radio, theta, phi,
            vel: 0.0003 + Math.random() * 0.001,
            rot: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02),
            offsetY: Math.random() * 6
        };
        scene.add(cristal);
        cristales.push(cristal);
    }
}

function crearFloresAmbientales() {
    for (let i = 0; i < 60; i++) {
        const tam = 0.3 + Math.random() * 0.8;
        const geo = new THREE.SphereGeometry(tam, 12, 12);
        const c = [0xff4d6d, 0xff8fab, 0xffc2d1, 0xffd700][Math.floor(Math.random() * 4)];
        const mat = new THREE.MeshStandardMaterial({
            color: c, emissive: c, emissiveIntensity: 0.7,
            metalness: 0.3, roughness: 0.4
        });
        const esf = new THREE.Mesh(geo, mat);
        const radio = 60 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        esf.position.set(radio * Math.sin(phi) * Math.cos(theta), radio * Math.cos(phi) * 0.6, radio * Math.sin(phi) * Math.sin(theta));
        esf.userData = { radio, theta, phi, velocidad: 0.0004 + Math.random() * 0.0012, offsetY: Math.random() * 6, baseY: esf.position.y };
        scene.add(esf);
        flores.push(esf);
    }
}

// ============================================
// CREAR FOTO
// ============================================
function crearFoto(indice) {
    const grupo = new THREE.Group();

    const marcoGeo = new THREE.BoxGeometry(24, 32, 0.6);
    const marcoMat = new THREE.MeshPhysicalMaterial({
        color: CONFIG.colorCorazon, emissive: CONFIG.colorCorazon, emissiveIntensity: 0.6,
        metalness: 0.9, roughness: 0.15, clearcoat: 1
    });
    grupo.add(new THREE.Mesh(marcoGeo, marcoMat));

    const fotoGeo = new THREE.PlaneGeometry(22, 30);
    const fotoMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const fotoMesh = new THREE.Mesh(fotoGeo, fotoMat);
    fotoMesh.position.z = 0.35;
    grupo.add(fotoMesh);

    const loader = new THREE.TextureLoader();
    loader.load(FOTOS[indice], (tex) => {
        fotoMat.map = tex;
        fotoMat.color.set(0xffffff);
        fotoMat.needsUpdate = true;
    });

    const auraGeo = new THREE.PlaneGeometry(35, 45);
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 77, 109, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 77, 109, 0.2)');
    grad.addColorStop(1, 'rgba(255, 77, 109, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const auraMat = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.z = -0.5;
    grupo.add(aura);

    return { grupo, fotoMesh };
}

// ============================================
// OBJETIVOS INTERACTIVOS
// ============================================
function crearObjetivo(tipo, indice) {
    let obj;
    
    if (tipo === 'orbe') {
        obj = crearOrbe();
        obj.userData = { tipo: 'orbe', indice: 0, eliminado: false, escalaBase: 0, hover: false };
    } else if (tipo === 'corazon') {
        obj = crearCorazonBloqueo();
        obj.userData = { tipo: 'corazon', indice, eliminado: false, escalaBase: 0, hover: false };
    } else if (tipo === 'estrella') {
        obj = crearEstrellaObjetivo();
        obj.userData = { tipo: 'estrella', indice, eliminado: false, escalaBase: 0, hover: false };
    } else if (tipo === 'cristal') {
        obj = crearCristalObjetivo();
        obj.userData = { tipo: 'cristal', indice, eliminado: false, escalaBase: 0, hover: false };
    }

    objetivos.push(obj);
    return obj;
}

function crearOrbe() {
    const grupo = new THREE.Group();
    const geo = new THREE.SphereGeometry(1.5, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
        color: CONFIG.colorDorado, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending
    });
    grupo.add(new THREE.Mesh(geo, mat));
    
    const auraGeo = new THREE.SphereGeometry(3, 24, 24);
    const auraMat = new THREE.MeshBasicMaterial({
        color: CONFIG.colorDorado, transparent: true, opacity: 0.15,
        blending: THREE.AdditiveBlending, side: THREE.BackSide
    });
    grupo.add(new THREE.Mesh(auraGeo, auraMat));
    
    for (let i = 0; i < 2; i++) {
        const ringGeo = new THREE.TorusGeometry(2.5 + i * 0.6, 0.1, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: i === 0 ? CONFIG.colorCorazon : CONFIG.colorDorado,
            transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        ring.userData.vel = (Math.random() - 0.5) * 0.03;
        grupo.add(ring);
    }
    return grupo;
}

function crearCorazonBloqueo() {
    const shape = new THREE.Shape();
    const s = 0.7;
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, 0, -s, -s, -s, -s * 2);
    shape.bezierCurveTo(-s, -s * 3, 0, -s * 3.5, 0, -s * 4);
    shape.bezierCurveTo(0, -s * 3.5, s, -s * 3, s, -s * 2);
    shape.bezierCurveTo(s, -s, 0, 0, 0, 0);

    const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.3, bevelEnabled: true,
        bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3
    });
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0xff4d6d, emissive: 0xff4d6d, emissiveIntensity: 1,
        metalness: 0.5, roughness: 0.3, clearcoat: 1
    });
    const corazon = new THREE.Mesh(geo, mat);
    corazon.rotation.z = Math.PI;

    const auraGeo = new THREE.SphereGeometry(3, 20, 20);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0xff4d6d, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, side: THREE.BackSide
    });
    corazon.add(new THREE.Mesh(auraGeo, auraMat));
    return corazon;
}

function crearEstrellaObjetivo() {
    const grupo = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(1, 0);
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 1.5,
        metalness: 0.8, roughness: 0.1, clearcoat: 1
    });
    grupo.add(new THREE.Mesh(geo, mat));
    const auraGeo = new THREE.SphereGeometry(2, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0xffd700, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, side: THREE.BackSide
    });
    grupo.add(new THREE.Mesh(auraGeo, auraMat));
    return grupo;
}

function crearCristalObjetivo() {
    const grupo = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1.3, 0);
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0x99ccff, emissive: 0x99ccff, emissiveIntensity: 1,
        metalness: 0.7, roughness: 0.1, transparent: true, opacity: 0.9,
        clearcoat: 1
    });
    grupo.add(new THREE.Mesh(geo, mat));
    const auraGeo = new THREE.SphereGeometry(2.3, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0x99ccff, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, side: THREE.BackSide
    });
    grupo.add(new THREE.Mesh(auraGeo, auraMat));
    return grupo;
}

function crearEsferaColor(color) {
    const grupo = new THREE.Group();
    const geo = new THREE.SphereGeometry(1.8, 32, 32);
    const mat = new THREE.MeshPhysicalMaterial({
        color: color, emissive: color, emissiveIntensity: 1.2,
        metalness: 0.6, roughness: 0.2, clearcoat: 1
    });
    grupo.add(new THREE.Mesh(geo, mat));
    const auraGeo = new THREE.SphereGeometry(3, 20, 20);
    const auraMat = new THREE.MeshBasicMaterial({
        color: color, transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending, side: THREE.BackSide
    });
    grupo.add(new THREE.Mesh(auraGeo, auraMat));
    return grupo;
}

// ============================================
// SECUENCIA
// ============================================
function iniciarSecuencia() {
    document.getElementById('progreso').classList.add('visible');
    document.getElementById('instruccion').classList.add('visible');
    actualizarProgreso();
    mostrarFoto(0);
}

function actualizarProgreso() {
    document.querySelectorAll('.punto').forEach((p, i) => {
        p.classList.remove('activo', 'completado');
        if (i < indiceFotoActual) p.classList.add('completado');
        if (i === indiceFotoActual) p.classList.add('activo');
    });
}

function mostrarFoto(indice) {
    indiceFotoActual = indice;
    actualizarProgreso();
    estadoActual = 'mostrandoFoto';
    tiempoEstado = 0;

    const foto = crearFoto(indice);
    fotoActual = foto.grupo;
    foto.grupo.position.set(0, 0, -300);
    foto.grupo.rotation.set(0, Math.PI * 2, 0);
    foto.grupo.scale.set(0.1, 0.1, 0.1);
    foto.grupo.userData = {
        titulo: HISTORIAS[indice].titulo,
        texto: HISTORIAS[indice].texto,
        indice: indice
    };
    scene.add(foto.grupo);

    document.getElementById('historia-titulo').textContent = "";
    document.getElementById('historia-texto').textContent = "";
    document.getElementById('historia').classList.remove('visible');
    document.getElementById('contador').classList.add('oculto');
    document.getElementById('codigo-desafio').classList.add('oculto');
}

function escribirTexto(indice) {
    const historia = HISTORIAS[indice];
    const hTitulo = document.getElementById('historia-titulo');
    const hTexto = document.getElementById('historia-texto');
    document.getElementById('historia').classList.add('visible');

    let i = 0;
    const intervalo = setInterval(() => {
        hTitulo.textContent = historia.titulo.slice(0, i + 1);
        i++;
        if (i >= historia.titulo.length) {
            clearInterval(intervalo);
            setTimeout(() => {
                let j = 0;
                const intervalo2 = setInterval(() => {
                    hTexto.textContent = historia.texto.slice(0, j + 1);
                    j++;
                    if (j >= historia.texto.length) clearInterval(intervalo2);
                }, 25);
            }, 300);
        }
    }, 60);
}

// ============================================
// LANZAR DESAFÍO SEGÚN LA FOTO
// ============================================
function lanzarDesafio(indice) {
    objetivos = [];
    objetivosRestantes = 0;
    
    if (indice === 0) {
        // Foto 1: 1 orbe
        objetivosTotales = 1;
        const obj = crearObjetivo('orbe', 0);
        obj.position.set(0, -22, 20);
        scene.add(obj);
        
        document.getElementById('instruccion-texto').textContent = "Toca la esfera dorada ✨";
        mostrarContador();
        
    } else if (indice === 1) {
        // Foto 2: 3 corazones
        objetivosTotales = 3;
        const posiciones = [[-25, 15, 10], [25, 15, 10], [0, -20, 15]];
        posiciones.forEach((p, i) => {
            const obj = crearObjetivo('corazon', i);
            obj.position.set(p[0], p[1], p[2]);
            obj.rotation.z = Math.PI;
            scene.add(obj);
        });
        document.getElementById('instruccion-texto').textContent = "Rompe los 3 corazones ❤️";
        mostrarContador();
        
    } else if (indice === 2) {
        // Foto 3: 5 estrellas
        objetivosTotales = 5;
        const posiciones = [[-30, 15, 5], [30, 15, 5], [0, 20, -5], [-20, -15, 10], [20, -15, 10]];
        posiciones.forEach((p, i) => {
            const obj = crearObjetivo('estrella', i);
            obj.position.set(p[0], p[1], p[2]);
            scene.add(obj);
        });
        document.getElementById('instruccion-texto').textContent = "Atrapa las 5 estrellas ⭐";
        mostrarContador();
        
    } else if (indice === 3) {
        // Foto 4: 7 cristales
        objetivosTotales = 7;
        const posiciones = [
            [-30, 18, 5], [30, 18, 5], [-40, 0, 10], [40, 0, 10],
            [-15, -20, 0], [15, -20, 0], [0, 25, -5]
        ];
        posiciones.forEach((p, i) => {
            const obj = crearObjetivo('cristal', i);
            obj.position.set(p[0], p[1], p[2]);
            scene.add(obj);
        });
        document.getElementById('instruccion-texto').textContent = "Rompe los 7 cristales 💎";
        mostrarContador();
        
    } else if (indice === 4) {
        // Foto 5: Desafío final - Fase 1: 5 corazones
        iniciarDesafioFinal();
    }
    
    objetivosRestantes = objetivosTotales;
    actualizarContador();
}

function mostrarContador() {
    document.getElementById('contador').classList.remove('oculto');
}

function actualizarContador() {
    document.getElementById('contador-numero').textContent = objetivosRestantes;
}

// ============================================
// DESAFÍO FINAL (FOTO 5)
// ============================================
function iniciarDesafioFinal() {
    faseFinal = 0;
    objetivos = [];
    objetivosTotales = 5;
    objetivosRestantes = 5;
    
    document.getElementById('instruccion-texto').textContent = "Rompe los 5 corazones ❤️";
    mostrarContador();
    
    const posiciones = [
        [-30, 20, 5], [30, 20, 5], [0, 25, -5], [-25, -18, 10], [25, -18, 10]
    ];
    posiciones.forEach((p, i) => {
        const obj = crearObjetivo('corazon', i);
        obj.position.set(p[0], p[1], p[2]);
        obj.rotation.z = Math.PI;
        scene.add(obj);
    });
}

function iniciarFaseMemorizar() {
    faseFinal = 1;
    document.getElementById('instruccion-texto').textContent = "Memoriza el orden de colores 👀";
    document.getElementById('contador').classList.add('oculto');
    
    // Generar código aleatorio
    const colores = [
        { color: 0xff4d6d, nombre: 'rosa' },
        { color: 0xffd700, nombre: 'dorado' },
        { color: 0x4d79ff, nombre: 'azul' }
    ];
    
    // Mezclar
    codigoColores = [];
    const copia = [...colores];
    for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        codigoColores.push(copia[idx]);
        copia.splice(idx, 1);
    }
    // Rellenar si es necesario (no debería)
    while (codigoColores.length < 3) codigoColores.push(colores[Math.floor(Math.random() * 3)]);
    
    // Mostrar código en pantalla
    const div = document.getElementById('codigo-colores');
    div.innerHTML = '';
    codigoColores.forEach(c => {
        const el = document.createElement('div');
        el.className = 'color-codigo';
        el.style.background = '#' + c.color.toString(16).padStart(6, '0');
        el.style.color = '#' + c.color.toString(16).padStart(6, '0');
        div.appendChild(el);
    });
    document.getElementById('codigo-desafio').classList.remove('oculto');
    
    // Después de 4 segundos, ocultar y empezar la secuencia
    setTimeout(() => {
        document.getElementById('codigo-desafio').classList.add('oculto');
        iniciarFaseSecuencia();
    }, 4000);
}

function iniciarFaseSecuencia() {
    faseFinal = 2;
    secuenciaUsuario = [];
    esferasFinales = [];
    
    document.getElementById('instruccion-texto').textContent = "Toca las esferas en el orden correcto 🎯";
    
    // Crear 3 esferas de colores en posiciones fijas, pero mezcladas
    const colores = [
        { color: 0xff4d6d, nombre: 'rosa' },
        { color: 0xffd700, nombre: 'dorado' },
        { color: 0x4d79ff, nombre: 'azul' }
    ];
    // Mezclar posiciones
    const posiciones = [[-25, 15, 10], [0, 20, 5], [25, 15, 10]];
    const coloresMezclados = [...colores].sort(() => Math.random() - 0.5);
    
    coloresMezclados.forEach((c, i) => {
        const esf = crearEsferaColor(c.color);
        esf.position.set(posiciones[i][0], posiciones[i][1], posiciones[i][2]);
        esf.userData = {
            tipo: 'esferaFinal',
            colorId: c.color,
            nombre: c.nombre,
            eliminado: false,
            escalaBase: 0,
            hover: false
        };
        scene.add(esf);
        esferasFinales.push(esf);
    });
}

function onEsferaFinalClick(esfera) {
    if (esfera.userData.eliminado) return;
    
    secuenciaUsuario.push(esfera.userData.colorId);
    const paso = secuenciaUsuario.length - 1;
    
    // ¿Correcto hasta ahora?
    if (secuenciaUsuario[paso] !== codigoColores[paso].color) {
        // ¡Fallo! Reiniciar secuencia
        secuenciaUsuario = [];
        cameraShake = 0.8;
        bloomPass.strength = 2;
        setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 300);
        document.getElementById('instruccion-texto').textContent = "¡Fallaste! Intenta de nuevo ❌";
        
        // Hacer que las esferas vibren
        esferasFinales.forEach(e => e.userData.temblar = true);
        setTimeout(() => {
            esferasFinales.forEach(e => e.userData.temblar = false);
            document.getElementById('instruccion-texto').textContent = "Toca las esferas en el orden correcto 🎯";
        }, 1000);
        return;
    }
    
    // ¡Correcto! Eliminar esa esfera
    esfera.userData.eliminado = true;
    crearBurst(esfera.position.x, esfera.position.y, esfera.position.z);
    
    // ¿Completó la secuencia?
    if (secuenciaUsuario.length === 3) {
        document.getElementById('instruccion-texto').textContent = "¡CÓDIGO CORRECTO! 🎉";
        cameraShake = 1.5;
        bloomPass.strength = 3;
        
        // Explosión final épica
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                crearBurst((Math.random()-0.5)*60, (Math.random()-0.5)*40, (Math.random()-0.5)*30);
            }, i * 100);
        }
        
        setTimeout(() => {
            revelarFotoFinal();
        }, 2000);
    }
}

function revelarFotoFinal() {
    // Limpiar esferas
    esferasFinales.forEach(e => {
        if (e.parent) scene.remove(e);
    });
    esferasFinales = [];
    
    document.getElementById('instruccion-texto').textContent = "";
    
    // Mostrar la foto final después de un momento
    setTimeout(() => {
        mostrarFoto(4);
    }, 800);
}

// ============================================
// BURST
// ============================================
function crearBurst(x, y, z) {
    for (let i = 0; i < 25; i++) {
        const geo = new THREE.SphereGeometry(0.4, 6, 6);
        const c = [0xff4d6d, 0xffd700, 0xff8fab, 0xffffff][Math.floor(Math.random() * 4)];
        const mat = new THREE.MeshBasicMaterial({
            color: c, transparent: true, opacity: 1, blending: THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.set(x, y, z);
        const angulo = Math.random() * Math.PI * 2;
        const elevacion = (Math.random() - 0.5) * Math.PI;
        const vel = 3 + Math.random() * 5;
        p.userData = {
            vida: 0, vidaMax: 1.5,
            vel: new THREE.Vector3(
                Math.cos(angulo) * Math.cos(elevacion) * vel,
                Math.sin(elevacion) * vel,
                Math.sin(angulo) * Math.cos(elevacion) * vel
            )
        };
        scene.add(p);
        bursts.push(p);
    }
}

// ============================================
// EVENTOS
// ============================================
function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseNDC.set(mouse.x, mouse.y);

    raycaster.setFromCamera(mouseNDC, camera);
    const todosObjetivos = objetivos.filter(o => !o.userData.eliminado);
    const hits = raycaster.intersectObjects(todosObjetivos, true);
    
    objetivos.forEach(o => o.userData.hover = false);
    
    if (hits.length > 0) {
        let objEncontrado = hits[0].object;
        // Buscar el grupo padre si es hijo
        while (objEncontrado.parent && !todosObjetivos.includes(objEncontrado)) {
            objEncontrado = objEncontrado.parent;
        }
        if (todosObjetivos.includes(objEncontrado)) {
            objEncontrado.userData.hover = true;
            document.body.style.cursor = 'pointer';
        }
    } else if (faseFinal === 2) {
        const hitsE = raycaster.intersectObjects(esferasFinales.filter(e => !e.userData.eliminado), true);
        if (hitsE.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'crosshair';
        }
    } else {
        document.body.style.cursor = 'crosshair';
    }
}

function onClick(e) {
    raycaster.setFromCamera(mouseNDC, camera);
    
    // Verificar clicks en objetivos normales
    const objetivosActivos = objetivos.filter(o => !o.userData.eliminado);
    const hits = raycaster.intersectObjects(objetivosActivos, true);
    
    if (hits.length > 0) {
        let objEncontrado = hits[0].object;
        while (objEncontrado.parent && !objetivosActivos.includes(objEncontrado)) {
            objEncontrado = objEncontrado.parent;
        }
        if (objetivosActivos.includes(objEncontrado)) {
            onObjetivoClick(objEncontrado);
            return;
        }
    }
    
    // Verificar clicks en esferas finales
    if (faseFinal === 2) {
        const esferasActivas = esferasFinales.filter(e => !e.userData.eliminado);
        const hitsE = raycaster.intersectObjects(esferasActivas, true);
        if (hitsE.length > 0) {
            let esfEncontrada = hitsE[0].object;
            while (esfEncontrada.parent && !esferasActivas.includes(esfEncontrada)) {
                esfEncontrada = esfEncontrada.parent;
            }
            if (esferasActivas.includes(esfEncontrada)) {
                onEsferaFinalClick(esfEncontrada);
                return;
            }
        }
    }
}

function onObjetivoClick(obj) {
    if (obj.userData.eliminado) return;
    obj.userData.eliminado = true;
    objetivosRestantes--;
    actualizarContador();
    
    crearBurst(obj.position.x, obj.position.y, obj.position.z);
    cameraShake = 0.4;
    bloomPass.strength = 2;
    setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 250);
    
    // ¿Terminó este desafío?
    if (objetivosRestantes <= 0) {
        document.getElementById('contador').classList.add('oculto');
        document.getElementById('instruccion-texto').textContent = "¡Desbloqueado! 🎉";
        
        // Si es el desafío final y estamos en fase 0, continuar
        if (indiceFotoActual === 4 && faseFinal === 0) {
            setTimeout(() => {
                iniciarFaseMemorizar();
            }, 1000);
        } else {
            // Siguiente foto
            setTimeout(() => {
                if (fotoActual) scene.remove(fotoActual);
                fotoActual = null;
                objetivos = [];
                document.getElementById('historia').classList.remove('visible');
                
                if (indiceFotoActual < 4) {
                    // Esperar un poco y lanzar la siguiente foto
                    setTimeout(() => {
                        mostrarFoto(indiceFotoActual + 1);
                    }, 800);
                }
            }, 1500);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// EASING
// ============================================
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ============================================
// ANIMACIÓN PRINCIPAL
// ============================================
function animar() {
    requestAnimationFrame(animar);
    const tiempo = reloj.getElapsedTime();
    const delta = reloj.getDelta();
    tiempoEstado += delta;

    // Ambiente
    if (estrellas) estrellas.rotation.y += 0.0001;
    nebulosas.forEach((n, i) => n.rotation.y += 0.0002 * (i + 1));
    nieblas.forEach(n => {
        n.rotation.z += n.userData.rotVel;
        n.position.y += Math.sin(tiempo * 0.3 + n.userData.offset) * 0.02;
    });
    planetas.forEach(p => {
        p.children[0].rotation.y += p.userData.rotVel;
        p.userData.orbT += p.userData.orbVel;
        const d = p.userData.orbR;
        p.position.x = d * Math.sin(p.userData.orbP) * Math.cos(p.userData.orbT);
        p.position.z = d * Math.sin(p.userData.orbP) * Math.sin(p.userData.orbT);
    });
    cristales.forEach(c => {
        const d = c.userData;
        d.theta += d.vel;
        c.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        c.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        c.rotation.x += d.rot.x;
        c.rotation.y += d.rot.y;
        c.rotation.z += d.rot.z;
    });
    flores.forEach((f, i) => {
        const d = f.userData;
        d.theta += d.velocidad;
        f.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        f.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        f.position.y = d.baseY + Math.sin(tiempo * 0.6 + d.offsetY) * 2;
        const resp = 1 + Math.sin(tiempo * 2 + i) * 0.12;
        f.scale.set(resp, resp, resp);
    });

    // === FOTO ACTUAL ===
    if (estadoActual === 'mostrandoFoto' && fotoActual) {
        const p = Math.min(tiempoEstado / 2, 1);
        const f = easeOutBack(p);
        fotoActual.position.z = -300 + 300 * f;
        fotoActual.rotation.y = Math.PI * 2 * (1 - f);
        const s = 0.1 + 0.9 * f;
        fotoActual.scale.set(s, s, s);
        if (fotoActual.children[2]) {
            fotoActual.children[2].material.opacity = 0.5 + Math.sin(tiempo * 3) * 0.3;
        }

        if (p >= 1) {
            escribirTexto(fotoActual.userData.indice);
            estadoActual = 'esperandoDesafio';
            setTimeout(() => {
                if (estadoActual === 'esperandoDesafio') {
                    lanzarDesafio(indiceFotoActual);
                    estadoActual = 'desafio';
                }
            }, 2500);
        }
    }

    // === OBJETIVOS INTERACTIVOS ===
    objetivos.forEach((obj, i) => {
        if (!obj.userData.eliminado) {
            // Aparición
            obj.userData.escalaBase = Math.min(1, obj.userData.escalaBase + 0.05);
            const hover = obj.userData.hover ? 1.25 : 1;
            const escalaFinal = obj.userData.escalaBase * hover;
            obj.scale.set(escalaFinal, escalaFinal, escalaFinal);
            
            // Rotación
            obj.rotation.y += 0.02;
            if (obj.userData.tipo === 'corazon') {
                obj.rotation.z = Math.PI + Math.sin(tiempo * 2 + i) * 0.1;
            }
            
            // Flotación
            obj.position.y += Math.sin(tiempo * 2 + i) * 0.03;
            
            // Anillos girando (solo para orbes)
            if (obj.userData.tipo === 'orbe') {
                obj.children.forEach(child => {
                    if (child.geometry && child.geometry.type === 'TorusGeometry') {
                        child.rotation.z += child.userData.vel;
                    }
                });
            }
        } else {
            // Desvanecerse
            const s = obj.scale.x * 0.85;
            obj.scale.set(s, s, s);
            obj.rotation.y += 0.3;
            if (obj.children[1]) obj.children[1].material.opacity *= 0.9;
            if (obj.children[0] && obj.children[0].material.opacity !== undefined) {
                obj.children[0].material.opacity *= 0.9;
            }
            if (s < 0.05 && obj.parent) scene.remove(obj);
        }
    });

    // === ESFERAS FINALES ===
    esferasFinales.forEach((e, i) => {
        if (!e.userData.eliminado) {
            e.userData.escalaBase = Math.min(1, e.userData.escalaBase + 0.05);
            const hover = e.userData.hover ? 1.25 : 1;
            const s = e.userData.escalaBase * hover;
            e.scale.set(s, s, s);
            e.rotation.y += 0.02;
            
            if (e.userData.temblar) {
                e.position.x += (Math.random() - 0.5) * 0.5;
            } else {
                e.position.y += Math.sin(tiempo * 2 + i) * 0.02;
            }
        } else {
            const s = e.scale.x * 0.85;
            e.scale.set(s, s, s);
            e.rotation.y += 0.3;
            if (s < 0.05 && e.parent) scene.remove(e);
        }
    });

    // === BURSTS ===
    for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.userData.vida += delta;
        const prog = p.userData.vida / p.userData.vidaMax;
        p.position.add(p.userData.vel);
        p.userData.vel.multiplyScalar(0.96);
        p.scale.setScalar(1 - prog);
        p.material.opacity = 1 - prog;
        if (prog >= 1) {
            scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            bursts.splice(i, 1);
        }
    }

    // === CAMERA SHAKE ===
    if (cameraShake > 0) {
        cameraShake *= 0.9;
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
        if (cameraShake < 0.01) cameraShake = 0;
    }

    controls.update();
    composer.render();
}

init();
