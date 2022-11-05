let scene = null;
let camera = null;
let renderer = null;

function handleInit() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const planeGeometry = new THREE.BoxGeometry(50, 20, 0.5);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xCCCCCC});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    plane.rotation.x = -90 / 180 * Math.PI;
    // plane.position.x = 5;
    // plane.position.y = 0;
    // plane.position.z = 0;
    plane.position.set(5, -0.5, 0);
    scene.add(plane);

    const cubeGeometry = new THREE.BoxGeometry(3.5, 3.5, 3.5);
    const cubeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000});
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    // cube.position.x = -10;
    // cube.position.y = 1.5;
    // cube.position.z = 0;
    cube.position.set(-10, 1.75, 0);
    scene.add(cube);

    const sphereGeometry = new THREE.SphereGeometry(3, 30, 30);
    const sphereMaterial = new THREE.MeshLambertMaterial({color: 0x0000FF});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;

    sphere.position.x = 15;
    sphere.position.y = 3;
    sphere.position.z = 0;
    scene.add(sphere);

    // camera.position.x = -30;
    // camera.position.y = 20;
    // camera.position.z = 30;
    camera.position.set(-30, 20, 30);
    camera.lookAt(scene.position);

    const ambientLight = new THREE.AmbientLight(0x0C0C0C);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    document.querySelector('#WebGL-output').appendChild(renderer.domElement);

    const controls = {
        rotationSpeed: 0.03,
        bouncingSpeed: 0.03,
        cameraX: -30,
        cameraY: 20,
        cameraZ: 30,
    };

    const gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'bouncingSpeed', 0, 0.5);
    gui.add(controls, 'cameraX', -50, 50);
    gui.add(controls, 'cameraY', -50, 50);
    gui.add(controls, 'cameraZ', -50, 50);

    let step = 0;
    function render() {
        cube.rotation.y += controls.rotationSpeed;

        step += controls.bouncingSpeed;
        sphere.position.x = 10 + (10 * Math.cos(step));
        sphere.position.y = 3 + (7.5 * Math.abs(Math.sin(step)));

        camera.position.x = controls.cameraX;
        camera.position.y = controls.cameraY;
        camera.position.z = controls.cameraZ;
        camera.lookAt(scene.position);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    render();
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('load', handleInit);
window.addEventListener('resize', handleResize);