// ============================================
// REGALO 3D CON MINI-JUEGO
// ============================================

let scene, camera, renderer, controls, composer, bloomPass;
let estrellas, nebulosas = [], nieblas = [], planetas = [], cristales = [], flores = [];
let fotoActual = null;
let reloj;
let raycaster = new THREE.Raycaster();
let mouseNDC = new THREE.Vector2();
let cameraShake = 0;
let bursts = [];

// Estado
let estado = 'intro';
let indiceFoto = 0;
let objetivos = [];
let objetivosRestantes = 0;
let objetivosTotales = 0;

// Desafío final
let faseFinal = 0;
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

// Nombres de las fotos (con espacio, tal como están en tu GitHub)
// Si las renombraste sin espacio, cámbialas aquí
const FOTOS = [
    "imagen 1.jpeg",
    "imagen 2.jpeg",
    "imagen 3.jpeg",
    "imagen 4.jpeg",
    "imagen 5.jpeg"
];

// Configuración de cada desafío
const DESAFIOS = [
    { tipo: 'orbe', total: 1, icono: '🔮', texto: 'Toca la esfera dorada' },
    { tipo: 'corazon', total: 3, icono: '❤️', texto: 'Rompe los 3 corazones' },
    { tipo: 'estrella', total: 5, icono: '⭐', texto: 'Atrapa las 5 estrellas' },
    { tipo: 'cristal', total: 7, icono: '💎', texto: 'Rompe los 7 cristales' },
    { tipo: 'final', total: 0, icono: '👑', texto: 'DESAFÍO FINAL' }
];

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
    document.getElementById('btn-empezar').addEventListener('click', empezar);

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
    const cantidad = 4000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cantidad * 3);
    const col = new Float32Array(cantidad * 3);
    const paleta = [new THREE.Color(0xffffff), new THREE.Color(0xffd700), new THREE.Color(0xffb3c6), new THREE.Color(0x99ccff)];
    for (let i = 0; i < cantidad; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2000;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        const c = paleta[Math.floor(Math.random() * paleta.length)];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
        size: 0.8, vertexColors: true, transparent: true,
        opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
    estrellas = new THREE.Points(geo, mat);
    scene.add(estrellas);
}

function crearNebulosas() {
    const coloresN = [0x6a00ff, 0xff00aa, 0xff4d6d, 0xffd700];
    for (let n = 0; n < 4; n++) {
        const cantidad = 500;
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
        nebulosas.push(new THREE.Points(geo, mat));
        scene.add(nebulosas[nebulosas.length - 1]);
    }
}

function crearNiebla() {
    for (let n = 0; n < 4; n++) {
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
        nieblas.push(niebla);
        scene.add(niebla);
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
            color: color, emissive: color, emissiveIntensity: 0.4,
            metalness: 0.5, roughness: 0.6
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const atmGeo = new THREE.SphereGeometry(tam * 1.15, 24, 24);
        const atmMat = new THREE.MeshBasicMaterial({
            color: color, transparent: true, opacity: 0.1,
            blending: THREE.AdditiveBlending, side: THREE.BackSide
        });
        grupo.add(new THREE.Mesh(atmGeo, atmMat));

        if (i % 2 === 0) {
            const aGeo = new THREE.TorusGeometry(tam * 1.7, 0.4, 12, 80);
            const aMat = new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const anillo = new THREE.Mesh(aGeo, aMat);
            anillo.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
            grupo.add(anillo);
        }

        const distancia = 400 + Math.random() * 300;
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
    for (let i = 0; i < 25; i++) {
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
        cristal.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.7,
            radio * Math.sin(phi) * Math.sin(theta)
        );
        cristal.userData = {
            radio, theta, phi,
            vel: 0.0003 + Math.random() * 0.001,
            rot: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02)
        };
        cristales.push(cristal);
        scene.add(cristal);
    }
}

function crearFloresAmbientales() {
    for (let i = 0; i < 50; i++) {
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
        esf.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.6,
            radio * Math.sin(phi) * Math.sin(theta)
        );
        esf.userData = { radio, theta, phi, velocidad: 0.0004 + Math.random() * 0.0012, baseY: esf.position.y };
        flores.push(esf);
        scene.add(esf);
    }
}

// ============================================
// EMPEZAR
// ============================================
function empezar() {
    document.getElementById('intro').classList.add('oculto');
    document.getElementById('progreso').classList.add('visible');
    document.getElementById('hud').classList.add('visible');
    estado = 'cargando';
    setTimeout(() => mostrarFoto(0), 500);
}

// ============================================
// FOTO
// ============================================
function mostrarFoto(indice) {
    indiceFoto = indice;
    actualizarProgreso();
    estado = 'mostrandoFoto';
    
    // Limpiar foto anterior
    if (fotoActual) {
        scene.remove(fotoActual);
        fotoActual = null;
    }

    // Crear la nueva foto
    const grupo = new THREE.Group();
    
    // Marco
    const marcoGeo = new THREE.BoxGeometry(24, 32, 0.6);
    const marcoMat = new THREE.MeshPhysicalMaterial({
        color: CONFIG.colorCorazon, emissive: CONFIG.colorCorazon, emissiveIntensity: 0.8,
        metalness: 0.9, roughness: 0.15, clearcoat: 1
    });
    grupo.add(new THREE.Mesh(marcoGeo, marcoMat));

    // Foto (con textura)
    const fotoGeo = new THREE.PlaneGeometry(22, 30);
    const fotoMat = new THREE.MeshBasicMaterial({ color: 0x552233 });
    const fotoMesh = new THREE.Mesh(fotoGeo, fotoMat);
    fotoMesh.position.z = 0.35;
    grupo.add(fotoMesh);

    // Cargar textura con manejo de errores
    const loader = new THREE.TextureLoader();
    const nombreFoto = FOTOS[indice];
    const urlFoto = encodeURI(nombreFoto);
    
    console.log('Cargando foto:', urlFoto);
    
    loader.load(urlFoto, 
        (tex) => {
            console.log('Foto cargada OK:', nombreFoto);
            fotoMat.map = tex;
            fotoMat.color.set(0xffffff);
            fotoMat.needsUpdate = true;
        },
        undefined,
        (err) => {
            console.error('Error cargando foto:', urlFoto, err);
            // Intenta con guión
            const urlAlt = urlFoto.replace(/ /g, '-');
            loader.load(urlAlt, (tex) => {
                fotoMat.map = tex;
                fotoMat.color.set(0xffffff);
                fotoMat.needsUpdate = true;
            });
        }
    );

    // Aura
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

    grupo.position.set(0, 0, -300);
    grupo.rotation.set(0, Math.PI * 2, 0);
    grupo.scale.set(0.1, 0.1, 0.1);
    grupo.userData = { tiempoInicio: reloj.getElapsedTime() };
    
    fotoActual = grupo;
    scene.add(grupo);

    // Texto
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
    const intervaloTitulo = setInterval(() => {
        hTitulo.textContent = historia.titulo.slice(0, i + 1);
        i++;
        if (i >= historia.titulo.length) {
            clearInterval(intervaloTitulo);
            setTimeout(() => {
                let j = 0;
                const intervaloTexto = setInterval(() => {
                    hTexto.textContent = historia.texto.slice(0, j + 1);
                    j++;
                    if (j >= historia.texto.length) clearInterval(intervaloTexto);
                }, 25);
            }, 300);
        }
    }, 60);
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
    objetivosRestantes = 0;
    const desafio = DESAFIOS[indice];
    
    // Actualizar HUD
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

    // Crear los objetivos
    for (let i = 0; i < desafio.total; i++) {
        const obj = crearObjetivo(desafio.tipo, i);
        // Distribuir en círculo
        const radio = 22;
        const theta = (i / desafio.total) * Math.PI * 2 + Math.random() * 0.3;
        const phi = Math.acos(2 * Math.random() - 1) * 0.6;
        obj.position.set(
            radio * Math.sin(phi) * Math.cos(theta),
            radio * Math.cos(phi) * 0.7,
            radio * Math.sin(phi) * Math.sin(theta) + 12
        );
        obj.userData.baseY = obj.position.y;
        obj.userData.offsetFlot = Math.random() * 6;
        obj.userData.escalaBase = 0;
        obj.userData.aparece = true;
        scene.add(obj);
        objetivos.push(obj);
    }
}

function actualizarContador() {
    document.getElementById('hud-contador').textContent = `${objetivosTotales - objetivosRestantes} / ${objetivosTotales}`;
}

function crearObjetivo(tipo, indice) {
    const grupo = new THREE.Group();
    
    if (tipo === 'orbe') {
        // Núcleo brillante
        const geo = new THREE.SphereGeometry(2, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorDorado, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        // Aura externa
        const auraGeo = new THREE.SphereGeometry(4, 24, 24);
        const auraMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorDorado, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, side: THREE.BackSide
        });
        grupo.add(new THREE.Mesh(auraGeo, auraMat));
        
        // Anillo pulsante
        const ringGeo = new THREE.TorusGeometry(3.5, 0.15, 8, 80);
        const ringMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorCorazon, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'corazon') {
        const shape = new THREE.Shape();
        const s = 0.9;
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0, 0, -s, -s, -s, -s*2);
        shape.bezierCurveTo(-s, -s*3, 0, -s*3.5, 0, -s*4);
        shape.bezierCurveTo(0, -s*3.5, s, -s*3, s, -s*2);
        shape.bezierCurveTo(s, -s, 0, 0, 0, 0);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.4, bevelEnabled: true,
            bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 4
        });
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xff4d6d, emissive: 0xff4d6d, emissiveIntensity: 1.2,
            metalness: 0.5, roughness: 0.3, clearcoat: 1
        });
        const corazon = new THREE.Mesh(geo, mat);
        corazon.rotation.z = Math.PI;
        corazon.position.y = 2;
        grupo.add(corazon);
        
        // Anillo pulsante alrededor
        const ringGeo = new THREE.TorusGeometry(4, 0.12, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffd700, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'estrella') {
        const geo = new THREE.OctahedronGeometry(2, 0);
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 1.8,
            metalness: 0.9, roughness: 0.1, clearcoat: 1
        });
        const estrella = new THREE.Mesh(geo, mat);
        estrella.scale.set(1.3, 1.3, 0.5);
        grupo.add(estrella);
        
        const ringGeo = new THREE.TorusGeometry(3.5, 0.12, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
    } else if (tipo === 'cristal') {
        const geo = new THREE.IcosahedronGeometry(2, 0);
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0x99ccff, emissive: 0x99ccff, emissiveIntensity: 1.5,
            metalness: 0.7, roughness: 0.1, transparent: true, opacity: 0.9,
            clearcoat: 1
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const ringGeo = new THREE.TorusGeometry(3.5, 0.12, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x99ccff, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
    }

    grupo.userData = {
        tipo: tipo,
        eliminado: false,
        hover: false,
        escalaBase: 0
    };
    return grupo;
}

function onObjetivoClick(obj) {
    if (obj.userData.eliminado) return;
    obj.userData.eliminado = true;
    objetivosRestantes--;
    actualizarContador();
    crearBurst(obj.position.x, obj.position.y, obj.position.z);
    cameraShake = 0.5;
    bloomPass.strength = 2.5;
    setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 300);

    if (objetivosRestantes <= 0) {
        // ¡Desafío completado!
        document.getElementById('hud-texto').textContent = '¡Completado! 🎉';
        document.getElementById('hud-contador').textContent = '✓';
        
        setTimeout(() => {
            objetivos.forEach(o => {
                if (o.parent) scene.remove(o);
            });
            objetivos = [];
            
            if (indiceFoto < 4) {
                // Siguiente foto
                if (fotoActual) scene.remove(fotoActual);
                fotoActual = null;
                document.getElementById('historia').classList.remove('visible');
                mostrarFoto(indiceFoto + 1);
            }
        }, 1500);
    }
}

// ============================================
// DESAFÍO FINAL (Foto 5)
// ============================================
function iniciarDesafioFinal() {
    faseFinal = 1;
    // Fase 1: 5 corazones
    objetivos = [];
    objetivosTotales = 5;
    objetivosRestantes = 5;
    actualizarContador();
    document.getElementById('hud-texto').textContent = 'Rompe los 5 corazones';
    estado = 'desafio';

    for (let i = 0; i < 5; i++) {
        const obj = crearObjetivo('corazon', i);
        const radio = 25;
        const theta = (i / 5) * Math.PI * 2;
        obj.position.set(
            radio * Math.cos(theta),
            20 * Math.sin(theta) * 0.5,
            radio * Math.sin(theta) * 0.5 + 12
        );
        obj.userData.baseY = obj.position.y;
        obj.userData.offsetFlot = Math.random() * 6;
        obj.userData.escalaBase = 0;
        scene.add(obj);
        objetivos.push(obj);
    }
}

function iniciarFaseMemorizar() {
    faseFinal = 2;
    document.getElementById('hud-texto').textContent = 'Memoriza el orden';
    document.getElementById('hud-contador').textContent = '👀';
    
    // Crear código aleatorio de 3 colores
    const colores = [
        { color: 0xff4d6d },
        { color: 0xffd700 },
        { color: 0x4d79ff }
    ];
    
    // Mezclar
    codigoColores = [];
    const copia = [...colores];
    for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        codigoColores.push(copia[idx]);
        copia.splice(idx, 1);
    }
    
    // Mostrar en pantalla
    const div = document.getElementById('codigo-colores');
    div.innerHTML = '';
    codigoColores.forEach(c => {
        const el = document.createElement('div');
        el.className = 'color-codigo';
        const hexColor = '#' + c.color.toString(16).padStart(6, '0');
        el.style.background = hexColor;
        el.style.boxShadow = `0 0 25px ${hexColor}`;
        div.appendChild(el);
    });
    document.getElementById('codigo').classList.remove('oculto');
    
    // Después de 4 seg, ocultar y empezar fase 3
    setTimeout(() => {
        document.getElementById('codigo').classList.add('oculto');
        iniciarFaseSecuencia();
    }, 4000);
}

function iniciarFaseSecuencia() {
    faseFinal = 3;
    secuenciaUsuario = [];
    esferasFinales = [];
    
    document.getElementById('hud-texto').textContent = 'Toca las esferas en el orden correcto';
    document.getElementById('hud-contador').textContent = '0 / 3';
    
    // Crear 3 esferas con los colores del código en posiciones aleatorias
    const posiciones = [[-25, 10, 10], [0, 20, 5], [25, 10, 10]];
    const coloresMezclados = [...codigoColores].sort(() => Math.random() - 0.5);
    
    coloresMezclados.forEach((c, i) => {
        const grupo = new THREE.Group();
        const geo = new THREE.SphereGeometry(2.5, 32, 32);
        const mat = new THREE.MeshPhysicalMaterial({
            color: c.color, emissive: c.color, emissiveIntensity: 1.2,
            metalness: 0.6, roughness: 0.2, clearcoat: 1
        });
        grupo.add(new THREE.Mesh(geo, mat));
        
        const ringGeo = new THREE.TorusGeometry(4, 0.15, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: c.color, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.esAnilloPulso = true;
        grupo.add(ring);
        
        grupo.position.set(posiciones[i][0], posiciones[i][1], posiciones[i][2]);
        grupo.userData = {
            tipo: 'esferaFinal',
            colorId: c.color,
            eliminado: false,
            hover: false,
            escalaBase: 0,
            baseY: posiciones[i][1]
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
        // Fallo
        secuenciaUsuario = [];
        cameraShake = 1;
        bloomPass.strength = 3;
        setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 400);
        document.getElementById('hud-texto').textContent = '❌ ¡Fallaste! Intenta de nuevo';
        document.getElementById('hud-contador').textContent = '0 / 3';
        
        setTimeout(() => {
            document.getElementById('hud-texto').textContent = 'Toca las esferas en el orden correcto';
        }, 1500);
        return;
    }
    
    // Correcto
    secuenciaUsuario.push(colorElegido);
    esfera.userData.eliminado = true;
    crearBurst(esfera.position.x, esfera.position.y, esfera.position.z);
    cameraShake = 0.4;
    
    document.getElementById('hud-contador').textContent = `${secuenciaUsuario.length} / 3`;
    
    if (secuenciaUsuario.length === 3) {
        // ¡Éxito!
        document.getElementById('hud-texto').textContent = '🎉 ¡CÓDIGO CORRECTO! 🎉';
        cameraShake = 2;
        bloomPass.strength = 4;
        
        // Explosión masiva
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                crearBurst(
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 30
                );
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
    
    document.getElementById('hud-texto').textContent = '✓ ¡TODO COMPLETADO! ❤️';
    document.getElementById('hud-contador').textContent = '5 / 5';
    
    setTimeout(() => {
        if (fotoActual) scene.remove(fotoActual);
        mostrarFoto(4);
    }, 800);
}

// ============================================
// BURST
// ============================================
function crearBurst(x, y, z) {
    for (let i = 0; i < 25; i++) {
        const geo = new THREE.SphereGeometry(0.5, 6, 6);
        const c = [0xff4d6d, 0xffd700, 0xff8fab, 0xffffff][Math.floor(Math.random() * 4)];
        const mat = new THREE.MeshBasicMaterial({
            color: c, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.set(x, y, z);
        const angulo = Math.random() * Math.PI * 2;
        const elevacion = (Math.random() - 0.5) * Math.PI;
        const vel = 4 + Math.random() * 6;
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
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);

    // Detectar hover en objetivos
    const activos = objetivos.filter(o => !o.userData.eliminado);
    const esferasActivas = esferasFinales.filter(e => !e.userData.eliminado);
    const todos = [...activos, ...esferasActivas];
    
    todos.forEach(o => o.userData.hover = false);
    
    const hits = raycaster.intersectObjects(todos, true);
    if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !todos.includes(obj)) obj = obj.parent;
        if (todos.includes(obj)) {
            obj.userData.hover = true;
            document.body.style.cursor = 'pointer';
            return;
        }
    }
    document.body.style.cursor = 'crosshair';
}

function onClick(e) {
    raycaster.setFromCamera(mouseNDC, camera);

    // Esferas finales
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

    // Objetivos normales
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

// ============================================
// ANIMACIÓN
// ============================================
function animar() {
    requestAnimationFrame(animar);
    const tiempo = reloj.getElapsedTime();
    const delta = reloj.getDelta();

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
        f.position.y = d.baseY + Math.sin(tiempo * 0.6 + i) * 2;
    });

    // === FOTO ACTUAL ===
    if (estado === 'mostrandoFoto' && fotoActual) {
        const t = tiempo - fotoActual.userData.tiempoInicio;
        const p = Math.min(t / 2, 1);
        const f = easeOutBack(p);
        fotoActual.position.z = -300 + 300 * f;
        fotoActual.rotation.y = Math.PI * 2 * (1 - f);
        const s = 0.1 + 0.9 * f;
        fotoActual.scale.set(s, s, s);
        
        if (fotoActual.children[2]) {
            fotoActual.children[2].material.opacity = 0.5 + Math.sin(tiempo * 3) * 0.3;
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
            obj.userData.escalaBase = Math.min(1, obj.userData.escalaBase + 0.06);
            const hover = obj.userData.hover ? 1.25 : 1;
            const escala = obj.userData.escalaBase * hover;
            obj.scale.set(escala, escala, escala);
            
            obj.rotation.y += 0.015;
            obj.position.y = obj.userData.baseY + Math.sin(tiempo * 2 + i) * 1.5;
            
            // Anillos pulsantes
            obj.children.forEach(child => {
                if (child.userData.esAnilloPulso) {
                    child.rotation.x = Math.PI / 2 + Math.sin(tiempo * 1.5 + i) * 0.3;
                    child.rotation.z = tiempo * 0.5 + i;
                    const s = 1 + Math.sin(tiempo * 3 + i) * 0.15;
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
            e.userData.escalaBase = Math.min(1, e.userData.escalaBase + 0.06);
            const hover = e.userData.hover ? 1.25 : 1;
            const s = e.userData.escalaBase * hover;
            e.scale.set(s, s, s);
            e.rotation.y += 0.015;
            e.position.y = e.userData.baseY + Math.sin(tiempo * 2 + i) * 1.5;
            
            e.children.forEach(child => {
                if (child.userData.esAnilloPulso) {
                    child.rotation.x = Math.PI / 2 + Math.sin(tiempo * 1.5 + i) * 0.3;
                    child.rotation.z = tiempo * 0.5 + i;
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

    // Camera shake
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
