// ============================================
// REGALO 3D DEFINITIVO - MÓVIL + PC
// ============================================

let scene, camera, renderer, composer, bloomPass;
let estrellas, nebulosas = [], auroras = [], planetas = [], cristalesAmb = [], floresAmb = [];
let meteoros = [], polvoDorado = [];
let fotoActual = null;
let reloj;
let raycaster = new THREE.Raycaster();
let pointerNDC = new THREE.Vector2();
let cameraShake = 0;
let bursts = [];
let objetosTocados = new Set();

// Estado
let estado = 'intro';
let indiceFoto = 0;
let objetivos = [];
let objetivosRestantes = 0;
let objetivosTotales = 0;
let timerRestante = 0;
let timerInterval = null;

// Final
let faseFinal = 0;
let codigoColores = [];
let secuenciaUsuario = [];
let esferasFinales = [];

const ES_MOVIL = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
const DPR = Math.min(window.devicePixelRatio || 1, ES_MOVIL ? 1.5 : 2);

const CONFIG = {
    colorCorazon: 0xff4d6d,
    colorDorado: 0xffd700,
    colorAzul: 0x4d79ff,
    colorVerde: 0x66ffaa,
    bloomIntensidad: 0.55
};

const HISTORIAS = [
    { titulo: "El día que te conocí", texto: "Desde ese momento algo cambió en mí. Tu sonrisa fue el comienzo de todo." },
    { titulo: "Nuestro primer momento", texto: "Cada segundo a tu lado se volvió un recuerdo que guardo con todo mi corazón." },
    { titulo: "Aventuras juntos", texto: "No importa el lugar, contigo todo se convierte en una historia bonita." },
    { titulo: "Momentos que atesoro", texto: "Gracias por cada risa, cada abrazo y cada instante compartido." },
    { titulo: "Y esto es solo el comienzo...", texto: "Te quiero más de lo que las palabras pueden decir. Feliz Día del Amor y la Amistad ❤️" }
];

const FOTOS = [
    "imagen 1.jpeg",
    "imagen 2.jpeg",
    "imagen 3.jpeg",
    "imagen 4.jpeg",
    "imagen 5.jpeg"
];

const DESAFIOS = [
    { tipo: 'orbe', total: 1, icono: '🔮', texto: 'Toca el orbe dorado', timer: 0, mov: 'orbitaLenta' },
    { tipo: 'corazon', total: 3, icono: '❤️', texto: 'Rompe los 3 corazones', timer: 0, mov: 'parpadeo' },
    { tipo: 'estrella', total: 5, icono: '⭐', texto: 'Atrapa las 5 estrellas giratorias', timer: 0, mov: 'orbitaRapida' },
    { tipo: 'cristal', total: 7, icono: '💎', texto: 'Rompe 7 cristales antes del tiempo', timer: 20, mov: 'flotante' },
    { tipo: 'final', total: 0, icono: '👑', texto: 'Desafío Final', timer: 0, mov: 'final' }
];

// ============================================
// INIT
// ============================================
function init() {
    reloj = new THREE.Clock();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0035);

    camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 0, 55);

    renderer = new THREE.WebGLRenderer({
        antialias: !ES_MOVIL,
        alpha: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(DPR);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.touchAction = 'none';
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomIntensidad, 0.6, 0.95
    );
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    configurarLuces();
    crearEstrellas();
    crearNebulosas();
    crearAuroras();
    crearPlanetas();
    crearCristalesAmbientales();
    crearFloresAmbientales();
    crearPolvoDorado();

    renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: false });
    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', onWindowResize);

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    const btn = document.getElementById('btn-empezar');
    btn.addEventListener('pointerdown', empezar);
    btn.addEventListener('click', (e) => e.preventDefault());

    animar();
}

function configurarLuces() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const l1 = new THREE.PointLight(CONFIG.colorCorazon, 1.8, 500);
    l1.position.set(30, 30, 50);
    scene.add(l1);
    const l2 = new THREE.PointLight(CONFIG.colorDorado, 1.3, 500);
    l2.position.set(-30, -25, 45);
    scene.add(l2);
    const l3 = new THREE.PointLight(CONFIG.colorAzul, 1.5, 500);
    l3.position.set(0, 25, -70);
    scene.add(l3);
    const l4 = new THREE.PointLight(0xff88cc, 1, 500);
    l4.position.set(40, -20, 30);
    scene.add(l4);
}

// ============================================
// AMBIENTE DETALLADO
// ============================================
function crearEstrellas() {
    const cantidad = ES_MOVIL ? 2000 : 5000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cantidad * 3);
    const col = new Float32Array(cantidad * 3);
    const size = new Float32Array(cantidad);
    const paleta = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xffd700),
        new THREE.Color(0xffb3c6),
        new THREE.Color(0x99ccff),
        new THREE.Color(0xff88cc)
    ];
    for (let i = 0; i < cantidad; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2200;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2200;
        const c = paleta[Math.floor(Math.random() * paleta.length)];
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
        size[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
        size: 0.85, vertexColors: true, transparent: true,
        opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
        sizeAttenuation: true
    });
    estrellas = new THREE.Points(geo, mat);
    scene.add(estrellas);
}

function crearNebulosas() {
    const coloresN = [0x6a00ff, 0xff00aa, 0xff4d6d, 0xffd700, 0x4d79ff];
    for (let n = 0; n < coloresN.length; n++) {
        const cantidad = ES_MOVIL ? 300 : 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(cantidad * 3);
        const c = new THREE.Color(coloresN[n]);
        const cx = (Math.random() - 0.5) * 700;
        const cy = (Math.random() - 0.5) * 400;
        const cz = (Math.random() - 0.5) * 700;
        for (let i = 0; i < cantidad; i++) {
            pos[i * 3] = cx + (Math.random() - 0.5) * 150;
            pos[i * 3 + 1] = cy + (Math.random() - 0.5) * 150;
            pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 150;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: c, size: 3.5, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const neb = new THREE.Points(geo, mat);
        nebulosas.push(neb);
        scene.add(neb);
    }
}

function crearAuroras() {
    // Capas de auroras onduladas
    const coloresAurora = [0xff4d6d, 0xffd700, 0x4d79ff, 0xff88cc];
    for (let a = 0; a < 4; a++) {
        const puntos = 60;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(puntos * 3);
        for (let i = 0; i < puntos; i++) {
            pos[i * 3] = (i - puntos / 2) * 3;
            pos[i * 3 + 1] = Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 4;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: coloresAurora[a],
            size: 1.8,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const aurora = new THREE.Points(geo, mat);
        aurora.position.set(
            (Math.random() - 0.5) * 100,
            30 + a * 5,
            -80 - a * 20
        );
        aurora.userData = {
            offset: Math.random() * Math.PI * 2,
            velocidad: 0.3 + Math.random() * 0.3,
            amplitud: 3 + Math.random() * 3,
            posicionesBase: pos.slice()
        };
        auroras.push(aurora);
        scene.add(aurora);
    }
}

function crearPlanetas() {
    const coloresP = [0x4d79ff, 0x9933ff, 0xff66aa, 0x33cc99, 0xffaa33];
    for (let i = 0; i < 4; i++) {
        const grupo = new THREE.Group();
        const tam = 6 + Math.random() * 10;
        const color = coloresP[i];
        const geo = new THREE.SphereGeometry(tam, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            metalness: 0.6,
            roughness: 0.5
        });
        grupo.add(new THREE.Mesh(geo, mat));

        // Atmósfera
        const atmGeo = new THREE.SphereGeometry(tam * 1.18, 24, 24);
        const atmMat = new THREE.MeshBasicMaterial({
            color: color, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, side: THREE.BackSide
        });
        grupo.add(new THREE.Mesh(atmGeo, atmMat));

        // Anillos
        if (i % 2 === 0) {
            const aGeo = new THREE.TorusGeometry(tam * 1.8, 0.5, 12, 100);
            const aMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.35,
                blending: THREE.AdditiveBlending
            });
            const anillo = new THREE.Mesh(aGeo, aMat);
            anillo.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.7;
            anillo.rotation.y = (Math.random() - 0.5) * 0.5;
            grupo.add(anillo);

            const a2Geo = new THREE.TorusGeometry(tam * 2.1, 0.3, 12, 100);
            const a2Mat = new THREE.MeshBasicMaterial({
                color: color, transparent: true, opacity: 0.25,
                blending: THREE.AdditiveBlending
            });
            const anillo2 = new THREE.Mesh(a2Geo, a2Mat);
            anillo2.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.7;
            grupo.add(anillo2);
        }

        // Luna
        if (i === 1) {
            const lunaGeo = new THREE.SphereGeometry(1.2, 12, 12);
            const lunaMat = new THREE.MeshStandardMaterial({
                color: 0xcccccc, emissive: 0x666666, emissiveIntensity: 0.4
            });
            const luna = new THREE.Mesh(lunaGeo, lunaMat);
            luna.userData.orbitaVel = 0.02;
            luna.userData.orbitaRadio = tam * 3;
            grupo.add(luna);
        }

        const distancia = 380 + Math.random() * 250;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        grupo.position.set(
            distancia * Math.sin(phi) * Math.cos(theta),
            distancia * Math.cos(phi) * 0.4,
            distancia * Math.sin(phi) * Math.sin(theta)
        );
        grupo.userData = {
            rotVel: (Math.random() - 0.5) * 0.004,
            orbVel: (Math.random() - 0.5) * 0.00015,
            orbR: distancia, orbT: theta, orbP: phi
        };
        planetas.push(grupo);
        scene.add(grupo);
    }
}

function crearCristalesAmbientales() {
    const cantidad = ES_MOVIL ? 20 : 35;
    for (let i = 0; i < cantidad; i++) {
        const tipo = Math.random();
        let geo;
        if (tipo < 0.4) geo = new THREE.OctahedronGeometry(0.6 + Math.random() * 1, 0);
        else if (tipo < 0.7) geo = new THREE.TetrahedronGeometry(0.6 + Math.random() * 1, 0);
        else geo = new THREE.IcosahedronGeometry(0.6 + Math.random() * 1, 0);

        const coloresC = [0xff4d6d, 0xffd700, 0x99ccff, 0xff8fab, 0xffffff];
        const c = coloresC[Math.floor(Math.random() * coloresC.length)];
        const mat = new THREE.MeshPhysicalMaterial({
            color: c,
            emissive: c,
            emissiveIntensity: 0.6,
            metalness: 0.5,
            roughness: 0.15,
            transparent: true,
            opacity: 0.85,
            clearcoat: 1
        });
        const cristal = new THREE.Mesh(geo, mat);
        const radio = 35 + Math.random() * 90;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        cristal.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.7,
            radio * Math.sin(phi) * Math.sin(theta)
        );
        cristal.userData = {
            radio, theta, phi,
            vel: 0.0003 + Math.random() * 0.001,
            rot: new THREE.Vector3(
                (Math.random() - 0.5) * 0.025,
                (Math.random() - 0.5) * 0.025,
                (Math.random() - 0.5) * 0.025
            )
        };
        cristalesAmb.push(cristal);
        scene.add(cristal);
    }
}

function crearFloresAmbientales() {
    const cantidad = ES_MOVIL ? 40 : 70;
    for (let i = 0; i < cantidad; i++) {
        const tam = 0.3 + Math.random() * 0.9;
        const geo = new THREE.SphereGeometry(tam, 12, 12);
        const c = [0xff4d6d, 0xff8fab, 0xffc2d1, 0xffd700, 0xff88cc][Math.floor(Math.random() * 5)];
        const mat = new THREE.MeshStandardMaterial({
            color: c,
            emissive: c,
            emissiveIntensity: 0.9,
            metalness: 0.3,
            roughness: 0.4
        });
        const esf = new THREE.Mesh(geo, mat);
        const radio = 50 + Math.random() * 90;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        esf.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.6,
            radio * Math.sin(phi) * Math.sin(theta)
        );
        esf.userData = {
            radio, theta, phi,
            velocidad: 0.0004 + Math.random() * 0.0012,
            baseY: esf.position.y,
            offsetY: Math.random() * 6,
            tamBase: tam
        };
        floresAmb.push(esf);
        scene.add(esf);
    }
}

function crearPolvoDorado() {
    const cantidad = ES_MOVIL ? 200 : 400;
    for (let i = 0; i < cantidad; i++) {
        const tam = 0.05 + Math.random() * 0.15;
        const geo = new THREE.SphereGeometry(tam, 4, 4);
        const c = [0xffd700, 0xff4d6d, 0xffffff, 0xff88cc][Math.floor(Math.random() * 4)];
        const mat = new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geo, mat);
        const radio = 15 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        p.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.8,
            radio * Math.sin(phi) * Math.sin(theta)
        );
        p.userData = {
            basePos: p.position.clone(),
            offset: Math.random() * Math.PI * 2,
            velY: 0.3 + Math.random() * 0.7,
            amplitud: 1 + Math.random() * 2
        };
        polvoDorado.push(p);
        scene.add(p);
    }
}

// ============================================
// EMPEZAR
// ============================================
function empezar(e) {
    e.preventDefault();
    document.getElementById('intro').classList.add('oculto');
    document.getElementById('progreso').classList.add('visible');
    document.getElementById('hud').classList.add('visible');
    estado = 'cargando';
    setTimeout(() => mostrarFoto(0), 400);
}

// ============================================
// FOTO
// ============================================
function mostrarFoto(indice) {
    indiceFoto = indice;
    actualizarProgreso();
    estado = 'mostrandoFoto';
    
    document.getElementById('hud-nivel').textContent = `NIVEL ${indice + 1} / 5`;

    if (fotoActual) {
        scene.remove(fotoActual);
        fotoActual = null;
    }

    const grupo = new THREE.Group();

    // Fondo negro detrás de la foto (evita que se vea lavada)
    const fondoGeo = new THREE.PlaneGeometry(24, 32);
    const fondoMat = new THREE.MeshBasicMaterial({ color: 0x0a0510 });
    const fondoMesh = new THREE.Mesh(fondoGeo, fondoMat);
    fondoMesh.position.z = -0.2;
    grupo.add(fondoMesh);

    // Marco dorado
    const marcoGeo = new THREE.BoxGeometry(25, 33, 0.5);
    const marcoMat = new THREE.MeshStandardMaterial({
        color: 0xcc9900,
        emissive: 0x553300,
        emissiveIntensity: 0.4,
        metalness: 0.95,
        roughness: 0.25
    });
    const marco = new THREE.Mesh(marcoGeo, marcoMat);
    marco.position.z = -0.15;
    grupo.add(marco);

    // Detalles decorativos del marco (esquinas)
    for (let i = 0; i < 4; i++) {
        const esquinaGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const esquinaMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 1,
            metalness: 1,
            roughness: 0.1
        });
        const esquina = new THREE.Mesh(esquinaGeo, esquinaMat);
        const ex = (i % 2) * 2 - 1;
        const ey = Math.floor(i / 2) * 2 - 1;
        esquina.position.set(ex * 12, ey * 16, 0.2);
        grupo.add(esquina);
    }

    // Foto real
    const fotoGeo = new THREE.PlaneGeometry(23, 31);
    const fotoMat = new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: false,
        toneMapped: false  // ESTO ES CLAVE: evita que el bloom y tone mapping la lave
    });
    const fotoMesh = new THREE.Mesh(fotoGeo, fotoMat);
    fotoMesh.position.z = 0.3;
    grupo.add(fotoMesh);

    const loader = new THREE.TextureLoader();
    const urlFoto = encodeURI(FOTOS[indice]);
    
    loader.load(
        urlFoto,
        (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            fotoMat.map = tex;
            fotoMat.color.set(0xffffff);
            fotoMat.needsUpdate = true;
        },
        undefined,
        () => {
            const urlAlt = urlFoto.replace(/%20/g, '-');
            loader.load(urlAlt, (tex) => {
                fotoMat.map = tex;
                fotoMat.color.set(0xffffff);
                fotoMat.needsUpdate = true;
            });
        }
    );

    // Aura exterior muy sutil
    const auraGeo = new THREE.PlaneGeometry(30, 38);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 77, 109, 0)');
    grad.addColorStop(0.7, 'rgba(255, 77, 109, 0.15)');
    grad.addColorStop(1, 'rgba(255, 77, 109, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const auraMat = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.z = -0.6;
    grupo.add(aura);

    grupo.position.set(0, 0, -300);
    grupo.rotation.set(0, Math.PI * 2, 0);
    grupo.scale.set(0.1, 0.1, 0.1);
    grupo.userData = { tiempoInicio: reloj.getElapsedTime(), textoEscrito: false };
    
    fotoActual = grupo;
    scene.add(grupo);

    document.getElementById('historia-titulo').textContent = "";
    document.getElementById('historia-texto').textContent = "";
    document.getElementById('historia').classList.remove('visible');
}

function escribirTexto(indice) {
    const historia = HISTORIAS[indice];
    const hTitulo = document.getElementById('historia-titulo');
    const hTexto = document.getElementById('historia-texto');
    document.getElementById('historia').classList.add('visible');

    let i = 0;
    const int1 = setInterval(() => {
        hTitulo.textContent = historia.titulo.slice(0, i + 1);
        i++;
        if (i >= historia.titulo.length) {
            clearInterval(int1);
            setTimeout(() => {
                let j = 0;
                const int2 = setInterval(() => {
                    hTexto.textContent = historia.texto.slice(0, j + 1);
                    j++;
                    if (j >= historia.texto.length) clearInterval(int2);
                }, 28);
            }, 300);
        }
    }, 65);
}

// ============================================
// DESAFÍOS
// ============================================
function actualizarProgreso() {
    const puntos = document.querySelectorAll('.punto');
    puntos.forEach((p, i) => {
        p.classList.remove('activo', 'completado');
        if (i < indiceFoto) p.classList.add('completado');
        if (i === indiceFoto) p.classList.add('activo');
    });
}

function lanzarDesafio(indice) {
    objetivos = [];
    objetivosTocados.clear();
    const desafio = DESAFIOS[indice];
    
    document.getElementById('hud-icono').textContent = desafio.icono;
    document.getElementById('hud-texto').textContent = desafio.texto;

    if (desafio.tipo === 'final') {
        iniciarDesafioFinal();
        return;
    }

    objetivosTotales = desafio.total;
    objetivosRestantes = desafio.total;
    actualizarContador();
    estado = 'desafio';

    if (desafio.timer > 0) iniciarTimer(desafio.timer);

    // Posiciones FIJA dentro del campo visible
    // Cámara a z=55, FOV 58° -> altura visible ~60, ancho ~100 en pantalla normal
    // Dejamos objetivos entre -25 y 25 en X, -18 y 18 en Y, a z=5
    const posicionesBase = [
        [0, 0, 5],                                   // 1 solo
        [-18, 8, 5], [18, 8, 5], [0, -12, 5],        // 3
        [-22, 12, 5], [22, 12, 5], [-12, -10, 5], [12, -10, 5], [0, 15, 5],   // 5
        [-24, 14, 5], [24, 14, 5], [-24, -8, 5], [24, -8, 5],                   // 7 primeros
        [-10, 0, 5], [10, 0, 5], [0, -15, 5]
    ];

    for (let i = 0; i < desafio.total; i++) {
        const obj = crearObjetivo(desafio.tipo, i);
        const p = posicionesBase[i % posicionesBase.length];
        obj.position.set(p[0], p[1], p[2]);
        obj.userData.baseX = p[0];
        obj.userData.baseY = p[1];
        obj.userData.baseZ = p[2];
        obj.userData.offsetFlot = Math.random() * 6;
        obj.userData.escalaBase = 0;
        obj.userData.rotVel = 0.012 + Math.random() * 0.02;
        obj.userData.mov = desafio.mov;
        obj.userData.phase = Math.random() * Math.PI * 2;
        
        if (desafio.mov === 'parpadeo') {
            obj.userData.visible = true;
            obj.userData.proximoCambio = Math.random() * 3;
        }
        if (desafio.mov === 'flotante') {
            obj.userData.velX = (Math.random() - 0.5) * 2;
            obj.userData.velY = (Math.random() - 0.5) * 2;
        }
        
        scene.add(obj);
        objetivos.push(obj);
    }
}

function actualizarContador() {
    document.getElementById('hud-contador').textContent = `${objetivosTotales - objetivosRestantes} / ${objetivosTotales}`;
}

function iniciarTimer(segundos) {
    timerRestante = segundos;
    const el = document.getElementById('hud-timer');
    el.classList.remove('oculto', 'alerta');
    el.textContent = segundos + 's';
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerRestante--;
        el.textContent = timerRestante + 's';
        if (timerRestante <= 5) el.classList.add('alerta');
        if (timerRestante <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            mostrarToast('⏰ ¡Tiempo agotado! Reiniciando...');
            setTimeout(() => {
                objetivos.forEach(o => { if (o.parent) scene.remove(o); });
                objetivos = [];
                el.classList.add('oculto');
                document.getElementById('hud-texto').textContent = 'Reiniciando desafío...';
                setTimeout(() => lanzarDesafio(indiceFoto), 900);
            }, 900);
        }
    }, 1000);
}

function detenerTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.getElementById('hud-timer').classList.add('oculto');
}

function crearObjetivo(tipo, indice) {
    const grupo = new THREE.Group();
    
    if (tipo === 'orbe') {
        const geo = new THREE.SphereGeometry(2.5, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorDorado, toneMapped: false
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const auraGeo = new THREE.SphereGeometry(5, 20, 20);
        const auraMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorDorado, transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, side: THREE.BackSide, toneMapped: false
        });
        grupo.add(new THREE.Mesh(auraGeo, auraMat));
        
        const ringGeo = new THREE.TorusGeometry(4, 0.2, 8, 80);
        const ringMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorCorazon, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'corazon') {
        const shape = new THREE.Shape();
        const s = 1;
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0, 0, -s, -s, -s, -s*2);
        shape.bezierCurveTo(-s, -s*3, 0, -s*3.5, 0, -s*4);
        shape.bezierCurveTo(0, -s*3.5, s, -s*3, s, -s*2);
        shape.bezierCurveTo(s, -s, 0, 0, 0, 0);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.5, bevelEnabled: true,
            bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 4
        });
        const mat = new THREE.MeshBasicMaterial({
            color: 0xff4d6d, toneMapped: false
        });
        const corazon = new THREE.Mesh(geo, mat);
        corazon.rotation.z = Math.PI;
        corazon.position.y = 2;
        grupo.add(corazon);
        
        const ringGeo = new THREE.TorusGeometry(4.5, 0.18, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffd700, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'estrella') {
        const geo = new THREE.OctahedronGeometry(2.5, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffd700, toneMapped: false
        });
        const estrella = new THREE.Mesh(geo, mat);
        estrella.scale.set(1.2, 1.2, 0.4);
        grupo.add(estrella);
        
        const ringGeo = new THREE.TorusGeometry(4.3, 0.18, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'cristal') {
        const geo = new THREE.IcosahedronGeometry(2.5, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x99ccff, toneMapped: false
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const ringGeo = new THREE.TorusGeometry(4.3, 0.18, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x99ccff, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
    }

    grupo.userData.tipo = tipo;
    grupo.userData.eliminado = false;
    grupo.userData.hover = false;
    return grupo;
}

function onObjetivoClick(obj) {
    if (obj.userData.eliminado) return;
    obj.userData.eliminado = true;
    objetivosRestantes--;
    actualizarContador();
    crearBurst(obj.position.x, obj.position.y, obj.position.z);
    cameraShake = 0.5;
    bloomPass.strength = 2;
    setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 250);

    if (objetivosRestantes <= 0) {
        detenerTimer();
        document.getElementById('hud-texto').textContent = '¡Completado! 🎉';
        document.getElementById('hud-contador').textContent = '✓';
        
        setTimeout(() => {
            objetivos.forEach(o => { if (o.parent) scene.remove(o); });
            objetivos = [];
            if (indiceFoto < 4) {
                if (fotoActual) scene.remove(fotoActual);
                fotoActual = null;
                document.getElementById('historia').classList.remove('visible');
                mostrarFoto(indiceFoto + 1);
            }
        }, 1400);
    }
}

// ============================================
// DESAFÍO FINAL
// ============================================
function iniciarDesafioFinal() {
    faseFinal = 1;
    objetivos = [];
    objetivosTotales = 5;
    objetivosRestantes = 5;
    actualizarContador();
    document.getElementById('hud-icono').textContent = '👑';
    document.getElementById('hud-texto').textContent = 'FASE 1: Rompe 5 corazones';
    estado = 'desafio';

    const posiciones = [[-18, 10], [18, 10], [0, 15], [-15, -10], [15, -10]];
    for (let i = 0; i < 5; i++) {
        const obj = crearObjetivo('corazon', i);
        obj.position.set(posiciones[i][0], posiciones[i][1], 5);
        obj.userData.baseX = posiciones[i][0];
        obj.userData.baseY = posiciones[i][1];
        obj.userData.baseZ = 5;
        obj.userData.escalaBase = 0;
        obj.userData.mov = 'orbitaRapida';
        obj.userData.offsetFlot = Math.random() * 6;
        obj.userData.phase = (i / 5) * Math.PI * 2;
        obj.userData.rotVel = 0.02;
        scene.add(obj);
        objetivos.push(obj);
    }
}

function iniciarFaseMemorizar() {
    faseFinal = 2;
    document.getElementById('hud-texto').textContent = 'FASE 2: Memoriza el orden';
    document.getElementById('hud-contador').textContent = '👀';
    
    const colores = [
        { color: 0xff4d6d },
        { color: 0xffd700 },
        { color: 0x4d79ff },
        { color: 0x66ffaa }
    ];
    
    codigoColores = [];
    const copia = [...colores];
    for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        codigoColores.push(copia[idx]);
        copia.splice(idx, 1);
    }
    
    const div = document.getElementById('codigo-colores');
    div.innerHTML = '';
    codigoColores.forEach(c => {
        const el = document.createElement('div');
        el.className = 'color-codigo';
        const hexColor = '#' + c.color.toString(16).padStart(6, '0');
        el.style.background = hexColor;
        el.style.boxShadow = `0 0 20px ${hexColor}`;
        div.appendChild(el);
    });
    document.getElementById('codigo').classList.remove('oculto');
    
    setTimeout(() => {
        document.getElementById('codigo').classList.add('oculto');
        iniciarFaseSecuencia();
    }, 5000);
}

function iniciarFaseSecuencia() {
    faseFinal = 3;
    secuenciaUsuario = [];
    esferasFinales = [];
    
    document.getElementById('hud-texto').textContent = 'FASE 3: Toca las esferas en orden';
    document.getElementById('hud-contador').textContent = '0 / 4';
    
    iniciarTimer(30);
    
    const posiciones = [[-18, 8], [-6, 14], [6, 8], [18, 14]];
    const coloresMezclados = [...codigoColores].sort(() => Math.random() - 0.5);
    
    coloresMezclados.forEach((c, i) => {
        const grupo = new THREE.Group();
        const geo = new THREE.SphereGeometry(2.8, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: c.color, toneMapped: false
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const ringGeo = new THREE.TorusGeometry(4.2, 0.18, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: c.color, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
        grupo.position.set(posiciones[i][0], posiciones[i][1], 5);
        grupo.userData = {
            tipo: 'esferaFinal',
            colorId: c.color,
            eliminado: false,
            hover: false,
            escalaBase: 0,
            baseY: posiciones[i][1],
            phase: i
        };
        scene.add(grupo);
        esferasFinales.push(grupo);
    });
}

function onEsferaFinalClick(esfera) {
    if (esfera.userData.eliminado) return;
    
    const paso = secuenciaUsuario.length;
    const colorEsperado = codigoColores[paso].color;
    const colorElegido = esfera.userData.colorId;
    
    if (colorElegido !== colorEsperado) {
        secuenciaUsuario = [];
        cameraShake = 1;
        bloomPass.strength = 2.5;
        setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 350);
        mostrarToast('❌ Orden incorrecto');
        document.getElementById('hud-contador').textContent = '0 / 4';
        
        esferasFinales.forEach(e => {
            e.userData.eliminado = false;
            e.userData.escalaBase = 1;
        });
        
        setTimeout(() => {
            document.getElementById('hud-texto').textContent = 'Toca las esferas en orden';
        }, 1200);
        return;
    }
    
    secuenciaUsuario.push(colorElegido);
    esfera.userData.eliminado = true;
    crearBurst(esfera.position.x, esfera.position.y, esfera.position.z);
    cameraShake = 0.4;
    bloomPass.strength = 2;
    setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 200);
    
    document.getElementById('hud-contador').textContent = `${secuenciaUsuario.length} / 4`;
    
    if (secuenciaUsuario.length === 4) {
        detenerTimer();
        document.getElementById('hud-texto').textContent = '🎉 ¡CÓDIGO CORRECTO! 🎉';
        cameraShake = 2;
        bloomPass.strength = 3.5;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                crearBurst(
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 35,
                    (Math.random() - 0.5) * 25
                );
            }, i * 100);
        }
        
        setTimeout(() => revelarFotoFinal(), 2000);
    }
}

function revelarFotoFinal() {
    esferasFinales.forEach(e => { if (e.parent) scene.remove(e); });
    esferasFinales = [];
    document.getElementById('hud-texto').textContent = '✓ ¡COMPLETADO! ❤️';
    document.getElementById('hud-contador').textContent = '5 / 5';
    setTimeout(() => {
        if (fotoActual) scene.remove(fotoActual);
        mostrarFoto(4);
    }, 700);
}

// ============================================
// TOAST
// ============================================
function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.remove('oculto');
    setTimeout(() => toast.classList.add('oculto'), 2000);
}

// ============================================
// BURST
// ============================================
function crearBurst(x, y, z) {
    const cantidad = ES_MOVIL ? 12 : 22;
    for (let i = 0; i < cantidad; i++) {
        const geo = new THREE.SphereGeometry(0.4, 5, 5);
        const c = [0xff4d6d, 0xffd700, 0xff8fab, 0xffffff, 0xff88cc][Math.floor(Math.random() * 5)];
        const mat = new THREE.MeshBasicMaterial({
            color: c, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending, toneMapped: false
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.set(x, y, z);
        const angulo = Math.random() * Math.PI * 2;
        const elevacion = (Math.random() - 0.5) * Math.PI;
        const vel = 3.5 + Math.random() * 5;
        p.userData = {
            vida: 0, vidaMax: 1.3,
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
// METEOROS (AHORA VISIBLES EN PC Y MÓVIL)
// ============================================
function crearMeteoro() {
    const grupo = new THREE.Group();
    
    // Cabeza brillante
    const cabezaGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const cabezaMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, toneMapped: false
    });
    grupo.add(new THREE.Mesh(cabezaGeo, cabezaMat));
    
    // Estela (varios puntos decrecientes)
    const coloresEstela = [0xffd700, 0xff8fab, 0xff4d6d, 0xffffff];
    for (let i = 0; i < 8; i++) {
        const t = (i + 1) / 8;
        const tamEstela = 0.7 * (1 - t * 0.8);
        const geo = new THREE.SphereGeometry(tamEstela, 6, 6);
        const mat = new THREE.MeshBasicMaterial({
            color: coloresEstela[i % coloresEstela.length],
            transparent: true,
            opacity: (1 - t) * 0.9,
            blending: THREE.AdditiveBlending,
            toneMapped: false
        });
        const punto = new THREE.Mesh(geo, mat);
        punto.position.set(t * 4, -t * 1.5, 0);
        grupo.add(punto);
    }
    
    // Punto de inicio aleatorio arriba-izquierda o arriba-derecha
    const lado = Math.random() > 0.5 ? 1 : -1;
    const startX = lado * (30 + Math.random() * 20);
    const startY = 25 + Math.random() * 15;
    const startZ = -10 + Math.random() * 20;
    
    grupo.position.set(startX, startY, startZ);
    
    // Ángulo descendente
    const anguloZ = lado > 0 ? -Math.PI / 5 : Math.PI / 5;
    grupo.rotation.z = anguloZ;
    
    // Velocidad
    const velX = -lado * (25 + Math.random() * 15);
    const velY = -15 - Math.random() * 10;
    
    grupo.userData = {
        vel: new THREE.Vector3(velX, velY, 0),
        vida: 0,
        vidaMax: 3
    };
    
    scene.add(grupo);
    return grupo;
}

// ============================================
// EVENTOS POINTER
// ============================================
function onPointerMove(e) {
    pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    if (estado === 'intro' || estado === 'cargando') return;
    
    raycaster.setFromCamera(pointerNDC, camera);
    
    const activos = objetivos.filter(o => !o.userData.eliminado);
    const esferasActivas = esferasFinales.filter(e => !e.userData.eliminado);
    const todos = [...activos, ...esferasActivas];
    
    todos.forEach(o => o.userData.hover = false);
    
    const hits = raycaster.intersectObjects(todos, true);
    if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !todos.includes(obj)) obj = obj.parent;
        if (todos.includes(obj)) obj.userData.hover = true;
    }
}

function onPointerDown(e) {
    e.preventDefault();
    
    pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    
    if (faseFinal === 3) {
        const esferasActivas = esferasFinales.filter(e => !e.userData.eliminado);
        const hits = raycaster.intersectObjects(esferasActivas, true);
        if (hits.length > 0) {
            let obj = hits[0].object;
            while (obj.parent && !esferasActivas.includes(obj)) obj = obj.parent;
            if (esferasActivas.includes(obj)) {
                onEsferaFinalClick(obj);
                return;
            }
        }
    }
    
    const activos = objetivos.filter(o => !o.userData.eliminado);
    const hits = raycaster.intersectObjects(activos, true);
    if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !activos.includes(obj)) obj = obj.parent;
        if (activos.includes(obj)) {
            onObjetivoClick(obj);
            return;
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
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ============================================
// ANIMACIÓN
// ============================================
function animar() {
    requestAnimationFrame(animar);
    const tiempo = reloj.getElapsedTime();
    const delta = Math.min(reloj.getDelta(), 0.08);

    // Estrellas
    if (estrellas) estrellas.rotation.y += 0.00008;

    // Nebulosas
    nebulosas.forEach((n, i) => {
        n.rotation.y += 0.00015 * (i + 1);
    });

    // Auroras
    auroras.forEach((a, idx) => {
        const pos = a.geometry.attributes.position.array;
        const base = a.userData.posicionesBase;
        for (let i = 0; i < pos.length / 3; i++) {
            const off = Math.sin(tiempo * a.userData.velocidad + i * 0.3 + a.userData.offset) * a.userData.amplitud;
            pos[i * 3 + 1] = base[i * 3 + 1] + off;
        }
        a.geometry.attributes.position.needsUpdate = true;
        a.material.opacity = 0.25 + Math.sin(tiempo * 0.5 + idx) * 0.15;
    });

    // Planetas
    planetas.forEach(p => {
        p.children[0].rotation.y += p.userData.rotVel;
        p.userData.orbT += p.userData.orbVel;
        const d = p.userData.orbR;
        p.position.x = d * Math.sin(p.userData.orbP) * Math.cos(p.userData.orbT);
        p.position.z = d * Math.sin(p.userData.orbP) * Math.sin(p.userData.orbT);
        
        // Luna orbitando
        p.children.forEach(c => {
            if (c.userData.orbitaVel) {
                c.position.x = Math.cos(tiempo * c.userData.orbitaVel) * c.userData.orbitaRadio;
                c.position.z = Math.sin(tiempo * c.userData.orbitaVel) * c.userData.orbitaRadio;
            }
        });
    });

    // Cristales ambientales
    cristalesAmb.forEach(c => {
        const d = c.userData;
        d.theta += d.vel;
        c.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        c.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        c.rotation.x += d.rot.x;
        c.rotation.y += d.rot.y;
        c.rotation.z += d.rot.z;
    });

    // Flores ambientales
    floresAmb.forEach((f, i) => {
        const d = f.userData;
        d.theta += d.velocidad;
        f.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        f.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        f.position.y = d.baseY + Math.sin(tiempo * 0.6 + d.offsetY) * 2.5;
        const resp = 1 + Math.sin(tiempo * 2 + i) * 0.18;
        f.scale.set(resp, resp, resp);
    });

    // Polvo dorado
    polvoDorado.forEach((p, i) => {
        const d = p.userData;
        p.position.y = d.basePos.y + Math.sin(tiempo * d.velY + d.offset) * d.amplitud;
        p.position.x = d.basePos.x + Math.cos(tiempo * d.velY * 0.7 + d.offset) * d.amplitud * 0.5;
    });

    // Meteoros
    for (let i = meteoros.length - 1; i >= 0; i--) {
        const m = meteoros[i];
        m.userData.vida += delta;
        m.position.x += m.userData.vel.x * delta;
        m.position.y += m.userData.vel.y * delta;
        
        // Estela desvaneciéndose
        m.children.forEach((c, idx) => {
            if (idx > 0 && c.material) {
                c.material.opacity = Math.max(0, c.material.opacity - delta * 0.3);
            }
        });
        
        if (m.userData.vida >= m.userData.vidaMax || m.position.y < -35) {
            scene.remove(m);
            meteoros.splice(i, 1);
        }
    }

    // Crear meteoros periódicamente
    if (tiempo > 2 && Math.random() < (ES_MOVIL ? 0.006 : 0.012)) {
        meteoros.push(crearMeteoro());
    }

    // === FOTO ACTUAL ===
    if (estado === 'mostrandoFoto' && fotoActual) {
        const t = tiempo - fotoActual.userData.tiempoInicio;
        const p = Math.min(t / 2, 1);
        const f = easeOutBack(p);
        fotoActual.position.z = -300 + 300 * f;
        fotoActual.rotation.y = Math.PI * 2 * (1 - f);
        const s = 0.1 + 0.9 * f;
        fotoActual.scale.set(s, s, s);

        // Flotación sutil
        if (p >= 1) {
            fotoActual.position.y = Math.sin(tiempo * 0.8) * 1.2;
            fotoActual.rotation.z = Math.sin(tiempo * 0.5) * 0.015;
        }
        
        // Aura pulsando
        if (fotoActual.children[5]) {
            fotoActual.children[5].material.opacity = 0.5 + Math.sin(tiempo * 2.5) * 0.25;
        }

        if (p >= 1 && !fotoActual.userData.textoEscrito) {
            fotoActual.userData.textoEscrito = true;
            escribirTexto(indiceFoto);
            setTimeout(() => {
                if (estado === 'mostrandoFoto') {
                    estado = 'desafio';
                    lanzarDesafio(indiceFoto);
                }
            }, 2500);
        }
    }

    // === OBJETIVOS ===
    objetivos.forEach((obj, i) => {
        if (!obj.userData.eliminado) {
            obj.userData.escalaBase = Math.min(1, obj.userData.escalaBase + 0.07);
            const hover = obj.userData.hover ? 1.22 : 1;
            const escala = obj.userData.escalaBase * hover;
            obj.scale.set(escala, escala, escala);
            
            obj.rotation.y += obj.userData.rotVel || 0.015;
            
            const mov = obj.userData.mov;
            const phase = obj.userData.phase || 0;
            
            if (mov === 'orbitaLenta') {
                obj.position.y = obj.userData.baseY + Math.sin(tiempo * 1.2 + phase) * 2;
                obj.position.x = obj.userData.baseX + Math.cos(tiempo * 0.8 + phase) * 2;
            } else if (mov === 'parpadeo') {
                obj.userData.proximoCambio -= delta;
                if (obj.userData.proximoCambio <= 0) {
                    obj.userData.visible = !obj.userData.visible;
                    obj.userData.proximoCambio = 0.6 + Math.random() * 1.2;
                }
                obj.visible = obj.userData.visible;
                obj.position.y = obj.userData.baseY + Math.sin(tiempo * 2 + i) * 1.5;
            } else if (mov === 'orbitaRapida') {
                obj.position.x = obj.userData.baseX + Math.cos(tiempo * 1.5 + phase) * 3;
                obj.position.y = obj.userData.baseY + Math.sin(tiempo * 1.8 + phase) * 3;
            } else if (mov === 'flotante') {
                obj.position.x = obj.userData.baseX + Math.sin(tiempo * 1.1 + i) * 4;
                obj.position.y = obj.userData.baseY + Math.cos(tiempo * 1.4 + i * 0.7) * 3;
                obj.position.z = obj.userData.baseZ + Math.sin(tiempo * 0.9 + i * 1.2) * 2;
            } else {
                obj.position.y = obj.userData.baseY + Math.sin(tiempo * 2 + i) * 1.5;
            }
            
            // Anillos pulsantes
            obj.children.forEach(child => {
                if (child.userData.esAnilloPulso) {
                    child.rotation.x = Math.PI / 2 + Math.sin(tiempo * 1.5 + i) * 0.3;
                    child.rotation.z = tiempo * 0.5 + i;
                    const s = 1 + Math.sin(tiempo * 3 + i) * 0.18;
                    child.scale.set(s, s, s);
                }
            });
        } else {
            const s = obj.scale.x * 0.85;
            obj.scale.set(s, s, s);
            obj.rotation.y += 0.3;
            if (s < 0.05 && obj.parent) scene.remove(obj);
        }
    });

    // === ESFERAS FINALES ===
    esferasFinales.forEach((e, i) => {
        if (!e.userData.eliminado) {
            e.userData.escalaBase = Math.min(1, e.userData.escalaBase + 0.07);
            const hover = e.userData.hover ? 1.22 : 1;
            const s = e.userData.escalaBase * hover;
            e.scale.set(s, s, s);
            e.rotation.y += 0.015;
            e.position.y = e.userData.baseY + Math.sin(tiempo * 2 + i) * 1.5;
            
            e.children.forEach(child => {
                if (child.userData.esAnilloPulso) {
                    child.rotation.x = Math.PI / 2 + Math.sin(tiempo * 1.5 + i) * 0.3;
                    child.rotation.z = tiempo * 0.5 + i;
                    const sc = 1 + Math.sin(tiempo * 3 + i) * 0.18;
                    child.scale.set(sc, sc, sc);
                }
            });
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

    // Cámara shake
    if (cameraShake > 0) {
        cameraShake *= 0.9;
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
        if (cameraShake < 0.01) cameraShake = 0;
    } else {
        // Retorno suave a posición base
        camera.position.x += (0 - camera.position.x) * 0.05;
        camera.position.y += (0 - camera.position.y) * 0.05;
    }

    // Movimiento cinematográfico de cámara (sutil)
    if (estado !== 'intro') {
        camera.position.x += Math.sin(tiempo * 0.2) * 0.008;
        camera.position.y += Math.cos(tiempo * 0.15) * 0.008;
        camera.lookAt(0, 0, 0);
    }

    composer.render();
}

init();
