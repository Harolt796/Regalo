// ============================================
// REGALO 3D INTERACTIVO - 8 SISTEMAS DE ANIMACIÓN
// ============================================

let scene, camera, renderer, controls, composer, bloomPass;
let textoMesh, subtituloMesh;
let corazonParticles, corazonPosicionesFinales;
let anillos = [], flores = [];
let estrellas, nebulosas = [];
let reloj;
let mouse = { x: 0, y: 0, screenX: 0, screenY: 0 };
let raycaster = new THREE.Raycaster();
let mouseNDC = new THREE.Vector2();

// Sistemas interactivos
let mouseTrail = [];
let bursts = [];
let fuegosArtificiales = [];
let petalos = [];
let corazonesFlotantes = [];
let lineasConstelacion = [];
let cameraShake = 0;

const CONFIG = {
    nombre: "Para Ti",
    subtitulo: "Con todo mi amor",
    fuenteURL: "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    colorCorazon: 0xff4d6d,
    colorTexto: 0xff4d6d,
    colorSubtitulo: 0xffd700,
    colorFlores: [0xff4d6d, 0xff8fab, 0xffc2d1, 0xffd700, 0xff99cc],
    bloomIntensidad: 1.5
};

function init() {
    reloj = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.004);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 10, 400);

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
    controls.minDistance = 40;
    controls.maxDistance = 250;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.3;
    controls.enabled = false;

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
    crearConstelaciones();
    cargarFuenteYCrearTexto();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove);

    animar();
}

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

// ============================================
// CORAZÓN PRINCIPAL
// ============================================
function crearCorazon() {
    const total = 15000;
    const posIni = new Float32Array(total * 3);
    const posFin = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);

    const colorRosa = new THREE.Color(CONFIG.colorCorazon);
    const colorBlanco = new THREE.Color(0xffffff);

    for (let i = 0; i < total; i++) {
        const t = Math.random() * Math.PI * 2;
        const grosor = 1 + (Math.random() - 0.5) * 0.5;
        const x2d = 16 * Math.pow(Math.sin(t), 3);
        const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 6 * grosor;
        const radio = 0.9 + Math.random() * 0.15;
        const factor = 1.4;

        posFin[i * 3] = x2d * factor * radio;
        posFin[i * 3 + 1] = y2d * factor * radio;
        posFin[i * 3 + 2] = z;

        const d = 400 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        posIni[i * 3] = d * Math.sin(phi) * Math.cos(theta);
        posIni[i * 3 + 1] = d * Math.cos(phi);
        posIni[i * 3 + 2] = d * Math.sin(phi) * Math.sin(theta);

        const mix = colorRosa.clone().lerp(colorBlanco, Math.random() * 0.6);
        colores[i * 3] = mix.r;
        colores[i * 3 + 1] = mix.g;
        colores[i * 3 + 2] = mix.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posIni, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const mat = new THREE.PointsMaterial({
        size: 1.2, vertexColors: true, transparent: true,
        opacity: 0.95, blending: THREE.AdditiveBlending,
        depthWrite: false, map: new THREE.CanvasTexture(canvas)
    });

    corazonParticles = new THREE.Points(geo, mat);
    corazonParticles.userData.original = new Float32Array(posIni);
    corazonPosicionesFinales = posFin;
    scene.add(corazonParticles);
}

function crearAnillos() {
    const colores = [0xff4d6d, 0xffd700, 0xff8fab];
    for (let i = 0; i < 3; i++) {
        const geo = new THREE.TorusGeometry(28 + i * 6, 0.15, 16, 200);
        const mat = new THREE.MeshBasicMaterial({
            color: colores[i], transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const anillo = new THREE.Mesh(geo, mat);
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

function crearFlores() {
    for (let i = 0; i < 100; i++) {
        const tam = 0.3 + Math.random() * 0.9;
        const geo = new THREE.SphereGeometry(tam, 16, 16);
        const c = CONFIG.colorFlores[Math.floor(Math.random() * CONFIG.colorFlores.length)];
        const mat = new THREE.MeshStandardMaterial({
            color: c, emissive: c, emissiveIntensity: 1,
            metalness: 0.4, roughness: 0.3
        });
        const esf = new THREE.Mesh(geo, mat);
        const radio = 50 + Math.random() * 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        esf.position.x = radio * Math.sin(phi) * Math.cos(theta);
        esf.position.y = radio * Math.cos(phi) * 0.6;
        esf.position.z = radio * Math.sin(phi) * Math.sin(theta);
        esf.userData = {
            radio, theta, phi,
            velocidad: 0.0005 + Math.random() * 0.0015,
            offsetY: Math.random() * Math.PI * 2,
            velocidadY: 0.3 + Math.random() * 0.6,
            baseY: esf.position.y
        };
        scene.add(esf);
        flores.push(esf);
    }
}

function crearEstrellas() {
    const cantidad = 6000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cantidad * 3);
    const col = new Float32Array(cantidad * 3);
    const paleta = [
        new THREE.Color(0xffffff), new THREE.Color(0xffd700),
        new THREE.Color(0xffb3c6), new THREE.Color(0x99ccff)
    ];
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
        const cantidad = 1000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(cantidad * 3);
        const c = new THREE.Color(coloresN[n]);
        const cx = (Math.random() - 0.5) * 400;
        const cy = (Math.random() - 0.5) * 200;
        const cz = (Math.random() - 0.5) * 400;
        for (let i = 0; i < cantidad; i++) {
            pos[i * 3] = cx + (Math.random() - 0.5) * 80;
            pos[i * 3 + 1] = cy + (Math.random() - 0.5) * 80;
            pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 80;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: c, size: 2, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const neb = new THREE.Points(geo, mat);
        scene.add(neb);
        nebulosas.push(neb);
    }
}

// ============================================
// CONSTELACIONES (Líneas que conectan estrellas)
// ============================================
function crearConstelaciones() {
    // Creamos grupos de estrellas brillantes cercanas
    const numConstelaciones = 6;
    for (let c = 0; c < numConstelaciones; c++) {
        const centroX = (Math.random() - 0.5) * 500;
        const centroY = (Math.random() - 0.5) * 300;
        const centroZ = (Math.random() - 0.5) * 500;
        const numPuntos = 5 + Math.floor(Math.random() * 4);
        const puntos = [];
        
        for (let p = 0; p < numPuntos; p++) {
            puntos.push(new THREE.Vector3(
                centroX + (Math.random() - 0.5) * 40,
                centroY + (Math.random() - 0.5) * 40,
                centroZ + (Math.random() - 0.5) * 40
            ));
        }
        
        // Crear líneas entre puntos cercanos
        const geo = new THREE.BufferGeometry();
        const posiciones = [];
        for (let i = 0; i < puntos.length - 1; i++) {
            posiciones.push(puntos[i].x, puntos[i].y, puntos[i].z);
            posiciones.push(puntos[i + 1].x, puntos[i + 1].y, puntos[i + 1].z);
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
        const mat = new THREE.LineBasicMaterial({
            color: 0xff8fab, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const linea = new THREE.LineSegments(geo, mat);
        scene.add(linea);
        lineasConstelacion.push(linea);
    }
}

// ============================================
// ESTELA DEL RATÓN (Sistema 1)
// ============================================
function crearTrailParticle(x, y) {
    const geo = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 6, 6);
    const coloresTrail = [0xff4d6d, 0xffd700, 0xffb3c6, 0xffffff];
    const c = coloresTrail[Math.floor(Math.random() * coloresTrail.length)];
    const mat = new THREE.MeshBasicMaterial({
        color: c, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const p = new THREE.Mesh(geo, mat);
    
    // Convertir posición de pantalla a mundo
    const v = new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
    v.unproject(camera);
    const dir = v.sub(camera.position).normalize();
    p.position.copy(camera.position.clone().add(dir.multiplyScalar(60)));
    
    p.userData = {
        vida: 0, vidaMax: 1.2,
        vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15 + 0.05,
            (Math.random() - 0.5) * 0.15
        )
    };
    scene.add(p);
    mouseTrail.push(p);
}

// ============================================
// BURST DE CORAZONES AL HACER CLIC (Sistema 2)
// ============================================
function crearBurst(x, y) {
    const v = new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
    v.unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const posMundo = camera.position.clone().add(dir.multiplyScalar(60));

    const total = 30;
    for (let i = 0; i < total; i++) {
        // Forma de corazón pequeño
        const t = (i / total) * Math.PI * 2;
        const x2d = 16 * Math.pow(Math.sin(t), 3);
        const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        const geo = new THREE.SphereGeometry(0.35, 6, 6);
        const mat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xff4d6d : 0xffd700,
            transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(posMundo);
        
        // Dirección hacia forma de corazón + dispersión
        p.userData = {
            vida: 0, vidaMax: 1.8,
            vel: new THREE.Vector3(
                x2d * 0.15 + (Math.random() - 0.5) * 0.3,
                y2d * 0.15 + (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.5
            )
        };
        scene.add(p);
        bursts.push(p);
    }
}

// ============================================
// FUEGOS ARTIFICIALES EN FORMA DE CORAZÓN (Sistema 4)
// ============================================
function crearFuegoArtificial() {
    const posIni = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        -80,
        (Math.random() - 0.5) * 100
    );

    // Cohete subiendo
    const geoCohete = new THREE.SphereGeometry(0.5, 8, 8);
    const matCohete = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 1,
        blending: THREE.AdditiveBlending
    });
    const cohete = new THREE.Mesh(geoCohete, matCohete);
    cohete.position.copy(posIni);
    cohete.userData = {
        vel: new THREE.Vector3(0, 40 + Math.random() * 20, 0),
        altura: 20 + Math.random() * 40,
        tipo: 'cohete'
    };
    scene.add(cohete);
    fuegosArtificiales.push(cohete);
}

function explotarFuegoArtificial(pos) {
    const total = 100;
    const colorBase = [0xff4d6d, 0xffd700, 0xff8fab, 0xff66cc][Math.floor(Math.random() * 4)];
    
    for (let i = 0; i < total; i++) {
        // Dirección en forma de corazón
        const t = (i / total) * Math.PI * 2;
        const x2d = 16 * Math.pow(Math.sin(t), 3);
        const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        const geo = new THREE.SphereGeometry(0.4, 6, 6);
        const mat = new THREE.MeshBasicMaterial({
            color: colorBase, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        p.userData = {
            vida: 0, vidaMax: 2.5,
            vel: new THREE.Vector3(
                x2d * 0.4,
                y2d * 0.4,
                (Math.random() - 0.5) * 3
            )
        };
        scene.add(p);
        fuegosArtificiales.push(p);
    }
    
    // Flash de luz
    cameraShake = 0.5;
}

// ============================================
// PÉTALOS CAYENDO (Sistema 5)
// ============================================
function crearPetalo() {
    // Pétalo como elipse achatada
    const geo = new THREE.SphereGeometry(0.6, 8, 6);
    geo.scale(1, 0.3, 0.7);
    const coloresP = [0xff4d6d, 0xff8fab, 0xffb3c6, 0xffd700, 0xffccdd];
    const c = coloresP[Math.floor(Math.random() * coloresP.length)];
    const mat = new THREE.MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: 0.4,
        metalness: 0.2, roughness: 0.6,
        transparent: true, opacity: 0.9, side: THREE.DoubleSide
    });
    const p = new THREE.Mesh(geo, mat);
    
    p.position.set(
        (Math.random() - 0.5) * 200,
        100 + Math.random() * 30,
        (Math.random() - 0.5) * 200
    );
    
    p.userData = {
        velY: -3 - Math.random() * 4,
        velX: (Math.random() - 0.5) * 1.5,
        velZ: (Math.random() - 0.5) * 1.5,
        rotVel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03
        )
    };
    scene.add(p);
    petalos.push(p);
}

// ============================================
// CORAZONES FLOTANTES (Sistema 6)
// ============================================
function crearCorazonFlotante() {
    const formaCorazon = new THREE.Shape();
    const s = 0.5;
    formaCorazon.moveTo(0, 0);
    formaCorazon.bezierCurveTo(0, 0, -s, -s, -s, -s * 2);
    formaCorazon.bezierCurveTo(-s, -s * 3, 0, -s * 3.5, 0, -s * 4);
    formaCorazon.bezierCurveTo(0, -s * 3.5, s, -s * 3, s, -s * 2);
    formaCorazon.bezierCurveTo(s, -s, 0, 0, 0, 0);

    const geo = new THREE.ExtrudeGeometry(formaCorazon, {
        depth: 0.2, bevelEnabled: true,
        bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2
    });
    const c = [0xff4d6d, 0xff8fab, 0xff66cc, 0xffd700][Math.floor(Math.random() * 4)];
    const mat = new THREE.MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: 0.6,
        metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.85
    });
    const corazon = new THREE.Mesh(geo, mat);
    
    corazon.position.set(
        (Math.random() - 0.5) * 120,
        -80,
        (Math.random() - 0.5) * 120
    );
    corazon.scale.setScalar(0.8 + Math.random() * 0.5);
    corazon.rotation.set(Math.PI, 0, (Math.random() - 0.5) * 0.5);
    
    corazon.userData = {
        velY: 2 + Math.random() * 2,
        rotVelY: (Math.random() - 0.5) * 0.02
    };
    scene.add(corazon);
    corazonesFlotantes.push(corazon);
}

// ============================================
// CARGAR TEXTO
// ============================================
function cargarFuenteYCrearTexto() {
    const fontLoader = new THREE.FontLoader();
    fontLoader.load(CONFIG.fuenteURL, (font) => {
        const geoP = new THREE.TextGeometry(CONFIG.nombre, {
            font, size: 5, height: 1, curveSegments: 16,
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
        textoMesh.scale.set(0.01, 0.01, 0.01);
        scene.add(textoMesh);

        const geoSub = new THREE.TextGeometry(CONFIG.subtitulo, {
            font, size: 1.6, height: 0.6, curveSegments: 12,
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

// ============================================
// EVENTOS
// ============================================
function onMouseMove(e) {
    mouse.screenX = e.clientX;
    mouse.screenY = e.clientY;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Estela
    if (Math.random() < 0.7) {
        crearTrailParticle(e.clientX, e.clientY);
    }
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
}

function onClick(e) {
    // Raycast para verificar si hizo clic en el corazón
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    
    // Verificar distancia al origen (corazón está en el centro)
    const punto = new THREE.Vector3();
    raycaster.ray.at(60, punto);
    const distAlCorazon = punto.length();
    
    if (distAlCorazon < 30) {
        // ¡Tocó el corazón! Onda expansiva épica
        cameraShake = 1.5;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => crearBurst(e.clientX, e.clientY), i * 100);
        }
        // Super flash
        bloomPass.strength = 4;
        setTimeout(() => bloomPass.strength = CONFIG.bloomIntensidad, 300);
    } else {
        // Clic normal: burst de corazones
        crearBurst(e.clientX, e.clientY);
        cameraShake = 0.3;
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
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// ============================================
// ANIMACIÓN PRINCIPAL
// ============================================
function animar() {
    requestAnimationFrame(animar);
    const tiempo = reloj.getElapsedTime();
    const delta = reloj.getDelta();

    // === INTRO: PARTÍCULAS SE JUNTAN ===
    if (corazonParticles) {
        const progreso = Math.min(tiempo / 5, 1);
        const factor = easeInOutCubic(progreso);
        const posiciones = corazonParticles.geometry.attributes.position.array;
        const original = corazonParticles.userData.original;
        for (let i = 0; i < posiciones.length; i++) {
            posiciones[i] = original[i] + (corazonPosicionesFinales[i] - original[i]) * factor;
        }
        corazonParticles.geometry.attributes.position.needsUpdate = true;
    }

    // === INTRO: CÁMARA VUELA ===
    if (tiempo < 7 && !controls.enabled) {
        const p = Math.min(Math.max((tiempo - 1) / 5, 0), 1);
        const f = easeOutExpo(p);
        camera.position.z = 400 - 400 * f + 70 * f;
        camera.position.y = 10 + 15 * f;
        camera.lookAt(0, 5, 0);
        if (p >= 1) {
            controls.enabled = true;
            controls.autoRotate = true;
            document.getElementById('instruccion').classList.add('visible');
        }
    }

    // === TEXTO APARECE ===
    if (tiempo > 4) {
        const p = Math.min((tiempo - 4) / 1.5, 1);
        const f = easeOutExpo(p);
        if (textoMesh) {
            textoMesh.scale.set(f, f, f);
            textoMesh.position.y = 45 + Math.sin(tiempo * 0.8) * 0.8;
        }
    }
    if (tiempo > 5) {
        const p = Math.min((tiempo - 5) / 1.5, 1);
        const f = easeOutExpo(p);
        if (subtituloMesh) {
            subtituloMesh.scale.set(f, f, f);
            subtituloMesh.position.y = 36 + Math.sin(tiempo * 0.8 + 0.5) * 0.6;
        }
    }

    // === LATIDO CON BLOOM ===
    if (tiempo > 4) {
        const t = tiempo * 1.5;
        const beat = Math.pow(Math.sin(t), 8) + 0.7 * Math.pow(Math.sin(t - 0.15), 8);
        const escala = 1 + beat * 0.06;
        corazonParticles.scale.set(escala, escala, escala);
        if (bloomPass && bloomPass.strength < 3) {
            bloomPass.strength = CONFIG.bloomIntensidad + beat * 0.8;
        }
        corazonParticles.rotation.y = Math.sin(tiempo * 0.3) * 0.12;
    }

    // === ANILLOS ===
    anillos.forEach(a => {
        a.rotation.x += a.userData.velX;
        a.rotation.y += a.userData.velY;
        a.rotation.z += a.userData.velZ;
    });

    // === FLORES ===
    flores.forEach((flor, i) => {
        const d = flor.userData;
        d.theta += d.velocidad;
        flor.position.x = d.radio * Math.sin(d.phi) * Math.cos(d.theta);
        flor.position.z = d.radio * Math.sin(d.phi) * Math.sin(d.theta);
        flor.position.y = d.baseY + Math.sin(tiempo * d.velocidadY + d.offsetY) * 3;
        const resp = 1 + Math.sin(tiempo * 2 + i) * 0.15;
        flor.scale.set(resp, resp, resp);
    });

    // === ESTRELLAS Y NEBULOSAS ===
    if (estrellas) {
        estrellas.rotation.y += 0.0002;
        estrellas.rotation.x += 0.0001;
    }
    nebulosas.forEach((n, i) => {
        n.rotation.y += 0.0003 * (i + 1);
    });

    // === CONSTELACIONES PULSANTES ===
    lineasConstelacion.forEach((l, i) => {
        l.material.opacity = 0.1 + Math.sin(tiempo * 0.5 + i) * 0.1;
    });

    // === ESTELA DEL RATÓN ===
    for (let i = mouseTrail.length - 1; i >= 0; i--) {
        const p = mouseTrail[i];
        p.userData.vida += delta;
        const prog = p.userData.vida / p.userData.vidaMax;
        p.position.add(p.userData.vel);
        p.userData.vel.y += 0.03; // Gravedad hacia arriba
        p.scale.setScalar(1 - prog);
        p.material.opacity = 1 - prog;
        if (prog >= 1) {
            scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            mouseTrail.splice(i, 1);
        }
    }

    // === BURSTS DE CLIC ===
    for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.userData.vida += delta;
        const prog = p.userData.vida / p.userData.vidaMax;
        p.position.add(p.userData.vel);
        p.userData.vel.multiplyScalar(0.98);
        p.scale.setScalar(1 - prog * 0.7);
        p.material.opacity = 1 - prog;
        if (prog >= 1) {
            scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            bursts.splice(i, 1);
        }
    }

    // === FUEGOS ARTIFICIALES ===
    // Crear uno cada ~4 segundos
    if (tiempo > 8 && Math.random() < 0.008) {
        crearFuegoArtificial();
    }
    for (let i = fuegosArtificiales.length - 1; i >= 0; i--) {
        const p = fuegosArtificiales[i];
        
        if (p.userData.tipo === 'cohete') {
            // Cohete sube
            p.position.add(p.userData.vel);
            p.userData.vel.y -= 0.5; // Gravedad
            p.userData.altura -= p.userData.vel.y * delta;
            
            if (p.userData.vel.y <= 0) {
                // ¡Explota!
                const posExplosion = p.position.clone();
                scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                fuegosArtificiales.splice(i, 1);
                explotarFuegoArtificial(posExplosion);
            }
        } else {
            // Partículas de explosión
            p.userData.vida += delta;
            const prog = p.userData.vida / p.userData.vidaMax;
            p.position.add(p.userData.vel);
            p.userData.vel.multiplyScalar(0.97);
            p.userData.vel.y -= 0.1; // Gravedad suave
            p.scale.setScalar(1 - prog);
            p.material.opacity = 1 - prog;
            if (prog >= 1) {
                scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                fuegosArtificiales.splice(i, 1);
            }
        }
    }

    // === PÉTALOS CAYENDO ===
    if (Math.random() < 0.15) crearPetalo();
    for (let i = petalos.length - 1; i >= 0; i--) {
        const p = petalos[i];
        p.position.y += p.userData.velY * delta * 3;
        p.position.x += p.userData.velX * delta * 3;
        p.position.z += p.userData.velZ * delta * 3;
        p.rotation.x += p.userData.rotVel.x;
        p.rotation.y += p.userData.rotVel.y;
        p.rotation.z += p.userData.rotVel.z;
        
        // Oscilación tipo hoja
        p.position.x += Math.sin(tiempo * 2 + i) * 0.03;
        
        if (p.position.y < -150) {
            scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            petalos.splice(i, 1);
        }
    }

    // === CORAZONES FLOTANTES ===
    if (Math.random() < 0.08) crearCorazonFlotante();
    for (let i = corazonesFlotantes.length - 1; i >= 0; i--) {
        const c = corazonesFlotantes[i];
        c.position.y += c.userData.velY * delta * 3;
        c.rotation.y += c.userData.rotVelY;
        c.position.x += Math.sin(tiempo + i) * 0.02;
        
        if (c.position.y > 150) {
            scene.remove(c);
            c.geometry.dispose();
            c.material.dispose();
            corazonesFlotantes.splice(i, 1);
        }
    }

    // === CAMERA SHAKE ===
    if (cameraShake > 0) {
        cameraShake *= 0.9;
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
        if (cameraShake < 0.01) cameraShake = 0;
    }

    // === ZOOM CINEMATOGRÁFICO PERIÓDICO ===
    if (tiempo > 10 && Math.floor(tiempo) % 20 === 0 && Math.random() < 0.01) {
        // Zoom in suave y regreso
        const baseZ = camera.position.length();
        // Se maneja con controls, así que solo rotamos
        controls.autoRotateSpeed = 1.5;
        setTimeout(() => controls.autoRotateSpeed = 0.3, 3000);
    }

    // === PARALAJE SUAVE ===
    if (controls.enabled && cameraShake === 0) {
        camera.position.x += (mouse.x * 2 - camera.position.x * 0.05) * 0.01;
    }

    controls.update();
    composer.render();
}

init();
