let scene = null;
let camera = null;
let renderer = null;

const handleLoad = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var axes = new THREE.AxesHelper(5);
    scene.add(axes);

    // ==================================================

    const solarSystem = new THREE.Object3D();
    solarSystem.position.x = 15;
    scene.add(solarSystem);

    const radius = 1;
    const widthSegments = 12;
    const heightSegments = 12;
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    const sunMaterial = new THREE.MeshPhongMaterial({
        emissive: 0xFFFF00,
        flatShading: true,
    });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(3, 3, 3);

    solarSystem.add(sunMesh);

    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    solarSystem.add(earthOrbit);

    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x22333FF,
        emissive: 0x112244,
        flatShading: true,
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthMesh.scale.set(1, 1, 1);

    earthOrbit.add(earthMesh);

    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit)

    const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        emissive: 0x222222,
        flatShading: true,
    });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(0.5, 0.5, 0.5);
    
    moonOrbit.add(moonMesh);

    // ==================================================

    const ambientLight = new THREE.AmbientLight(0x0C0C0C);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(50, 50, 50);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const controls = {
        cameraX: 40,
        cameraY: 40,
        cameraZ: 40,
    };

    const gui = new dat.GUI();
    gui.add(controls, 'cameraX', -100, 100);
    gui.add(controls, 'cameraY', -100, 100);
    gui.add(controls, 'cameraZ', -100, 100);

    document.querySelector('#WebGL-output').appendChild(renderer.domElement);
    requestAnimationFrame(render);

    let now = Date.now();
    function render() {
        let time = Date.now() - now;
        solarSystem.rotation.y += time * 0.002;
        earthOrbit.rotation.y += time * 0.003;
        moonOrbit.rotation.y += time * 0.004;
        now = Date.now();

        camera.position.x = controls.cameraX;
        camera.position.y = controls.cameraY;
        camera.position.z = controls.cameraZ;
        camera.lookAt(scene.position);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
};

const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('load', handleLoad);
window.addEventListener('resize', handleResize);

/*
    The structure and class of each one is described below. It is called 'Scene Graph'.

    solarSystem (Object3D) - sunMesh (Mesh)
                           - earthOrbit (Object3D) - earthMesh (Mesh)
                                                   - moonOrbit (Object3D) - moonMesh (Mesh)
*/