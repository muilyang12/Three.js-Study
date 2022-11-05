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

    const planeGeometry = new THREE.BoxGeometry(40, 20, 0.5);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xCCCCCC});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    plane.rotation.x = -90 / 180 * Math.PI;
    plane.position.x = 5;
    plane.position.y = -0.25;
    plane.position.z = -5;
    // plane.position.set(0, 0, 0);
    scene.add(plane);

    camera.position.x = -20;
    camera.position.y = 20;
    camera.position.z = 20;
    // camera.position.set(-20, 20, 20);
    camera.lookAt(scene.position);

    const ambientLight = new THREE.AmbientLight(0x0C0C0C);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const vertices = new Float32Array([
        0.0, 0.0, 0.0,
        5.0, 0.0, 0.0,
        5.0, 5.0, 0.0,

        5.0, 5.0, 0.0,
        0.0, 5.0, 0.0,
        0.0, 0.0, 0.0,

        0.0, 0.0, -5.0,
        0.0, 0.0, 0.0,
        0.0, 5.0, 0.0,
        
        0.0, 5.0, 0.0,
        0.0, 5.0, -5.0,
        0.0, 0.0, -5.0,

        5.0, 0.0, -5.0,
        0.0, 0.0, -5.0,
        0.0, 5.0, -5.0,

        0.0, 5.0, -5.0,
        5.0, 5.0, -5.0,
        5.0, 0.0, -5.0,

        5.0, 0.0, 0.0,
        5.0, 0.0, -5.0,
        5.0, 5.0, -5.0,

        5.0, 5.0, -5.0,
        5.0, 5.0, 0.0,
        5.0, 0.0, 0.0,

        0.0, 5.0, -5.0,
        0.0, 5.0, 0.0,
        5.0, 5.0, 0.0, 

        5.0, 5.0, 0.0, 
        5.0, 5.0, -5.0,
        0.0, 5.0, -5.0,

        5.0, 0.0, -5.0,
        5.0, 0.0, 0.0,
        0.0, 0.0, 0.0,

        0.0, 0.0, 0.0,
        0.0, 0.0, -5.0,
        5.0, 0.0, -5.0,
    ]);

    const colors = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });

    const object = new THREE.Mesh(geometry, material);
    object.castShadow = true;

    scene.add(object);

    document.querySelector('#WebGL-output').appendChild(renderer.domElement);

    const controls = {
        cameraX: -20,
        cameraY: 20,
        cameraZ: 20,
    };

    const verticesCoordinates = {
        vertex1: {
            vertex1_X: 5.0,
            vertex1_Y: 5.0,
            vertex1_Z: 0.0,
        },

        vertex2: {
            vertex2_X: 0.0,
            vertex2_Y: 5.0,
            vertex2_Z: -5.0,
        },
    };

    const gui = new dat.GUI();
    gui.add(controls, 'cameraX', -50, 50);
    gui.add(controls, 'cameraY', -50, 50);
    gui.add(controls, 'cameraZ', -50, 50);

    const guiVertex1 = gui.addFolder('vertex1');
    guiVertex1.add(verticesCoordinates.vertex1, 'vertex1_X', 5, 20);
    guiVertex1.add(verticesCoordinates.vertex1, 'vertex1_Y', 5, 20);
    guiVertex1.add(verticesCoordinates.vertex1, 'vertex1_Z', 0, 15);
    const guiVertex2 = gui.addFolder('vertex2');
    guiVertex2.add(verticesCoordinates.vertex2, 'vertex2_X', -15, 0);
    guiVertex2.add(verticesCoordinates.vertex2, 'vertex2_Y', 5, 20);
    guiVertex2.add(verticesCoordinates.vertex2, 'vertex2_Z', -20, -5);

    guiVertex1.open();
    guiVertex2.open();

    object.geometry.attributes.position.needsUpdate = true;

    function render() {
        camera.position.x = controls.cameraX;
        camera.position.y = controls.cameraY;
        camera.position.z = controls.cameraZ;
        camera.lookAt(scene.position);

        const newVertices = new Float32Array([
            0.0, 0.0, 0.0,
            5.0, 0.0, 0.0,
            verticesCoordinates.vertex1.vertex1_X, verticesCoordinates.vertex1.vertex1_Y, verticesCoordinates.vertex1.vertex1_Z, 
    
            verticesCoordinates.vertex1.vertex1_X, verticesCoordinates.vertex1.vertex1_Y, verticesCoordinates.vertex1.vertex1_Z, 
            0.0, 5.0, 0.0,
            0.0, 0.0, 0.0,
    
            0.0, 0.0, -5.0,
            0.0, 0.0, 0.0,
            0.0, 5.0, 0.0,
            
            0.0, 5.0, 0.0,
            verticesCoordinates.vertex2.vertex2_X, verticesCoordinates.vertex2.vertex2_Y, verticesCoordinates.vertex2.vertex2_Z,
            0.0, 0.0, -5.0,
    
            5.0, 0.0, -5.0,
            0.0, 0.0, -5.0,
            verticesCoordinates.vertex2.vertex2_X, verticesCoordinates.vertex2.vertex2_Y, verticesCoordinates.vertex2.vertex2_Z,
    
            verticesCoordinates.vertex2.vertex2_X, verticesCoordinates.vertex2.vertex2_Y, verticesCoordinates.vertex2.vertex2_Z,
            5.0, 5.0, -5.0,
            5.0, 0.0, -5.0,
    
            5.0, 0.0, 0.0,
            5.0, 0.0, -5.0,
            5.0, 5.0, -5.0,
    
            5.0, 5.0, -5.0,
            verticesCoordinates.vertex1.vertex1_X, verticesCoordinates.vertex1.vertex1_Y, verticesCoordinates.vertex1.vertex1_Z, 
            5.0, 0.0, 0.0,
    
            verticesCoordinates.vertex2.vertex2_X, verticesCoordinates.vertex2.vertex2_Y, verticesCoordinates.vertex2.vertex2_Z,
            0.0, 5.0, 0.0,
            verticesCoordinates.vertex1.vertex1_X, verticesCoordinates.vertex1.vertex1_Y, verticesCoordinates.vertex1.vertex1_Z, 
    
            verticesCoordinates.vertex1.vertex1_X, verticesCoordinates.vertex1.vertex1_Y, verticesCoordinates.vertex1.vertex1_Z, 
            5.0, 5.0, -5.0,
            verticesCoordinates.vertex2.vertex2_X, verticesCoordinates.vertex2.vertex2_Y, verticesCoordinates.vertex2.vertex2_Z,
    
            5.0, 0.0, -5.0,
            5.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
    
            0.0, 0.0, 0.0,
            0.0, 0.0, -5.0,
            5.0, 0.0, -5.0,
        ]);
        const newPosition = new THREE.BufferAttribute(newVertices, 3);
        object.geometry.setAttribute('position', newPosition);

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