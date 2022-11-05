let scene = null;
let camera = null;
let renderer = null;

const draw2DHeart = () => {
    const shape = new THREE.Shape();

    let x = -30;
    let y = 30;

    shape.moveTo( x, y );
    shape.bezierCurveTo( x, y, x - 1, y + 5, x - 5, y + 5 );
    shape.bezierCurveTo( x - 11, y + 5, x - 11, y - 2, x - 11, y - 2 );
    shape.bezierCurveTo( x - 11, y - 6, x - 8, y - 10.4, x, y - 14 );
    shape.bezierCurveTo( x + 7, y - 10.4, x + 11, y - 6, x + 11, y - 2 );
    shape.bezierCurveTo( x + 11, y - 2, x + 11, y + 5, x + 5, y + 5 );
    shape.bezierCurveTo( x + 2, y + 5, x, y, x, y );

    return shape;
};

const draw2DFace = () => {
    const shape = new THREE.Shape();

    shape.moveTo(10, 10);
    shape.splineThru([
        new THREE.Vector2(12, 20),
        new THREE.Vector2(8, 30),
        new THREE.Vector2(10, 40),
    ]);
    shape.bezierCurveTo(15, 25, 25, 25, 30, 40);
    shape.splineThru([
        new THREE.Vector2(32, 30),
        new THREE.Vector2(28, 20),
        new THREE.Vector2(30, 10),
    ]);
    shape.lineTo(10, 10);

    const leftEye = new THREE.Path();
    leftEye.absellipse(16, 24, 2, 3, 0, 2 * Math.PI, true);
    shape.holes.push(leftEye);

    const rightEye = new THREE.Path();
    rightEye.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(rightEye);

    const mouth = new THREE.Path();
    mouth.absarc(20, 16, 3, 0, Math.PI, true);
    shape.holes.push(mouth);

    return shape;
};

const handleLoad = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('#WebGL-output').appendChild(renderer.domElement);

    var axes = new THREE.AxesHelper(5);
    scene.add(axes);

    const extrudeSettings = {
        steps: 2,
        depth: 30,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 1,
        bevelOffset: 1,
        bevelSegments: 1,
    };

    const heart2DGeometry = new THREE.ShapeGeometry(draw2DHeart());
    const heart3DGeometry = new THREE.ExtrudeGeometry(draw2DHeart(), extrudeSettings);
    const heartMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
    const heart2D = new THREE.Mesh(heart2DGeometry, heartMaterial);
    const heart3D = new THREE.Mesh(heart3DGeometry, heartMaterial);
    
    heart2D.position.z = -20;
    scene.add(heart2D);
    scene.add(heart3D);

    const face2DGeometry = new THREE.ShapeGeometry(draw2DFace());
    const face3DGeometry = new THREE.ExtrudeGeometry(draw2DFace(), extrudeSettings);
    const faceMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
    const face2D = new THREE.Mesh(face2DGeometry, faceMaterial);
    const face3D = new THREE.Mesh(face3DGeometry, faceMaterial);

    face2D.position.z = -20;
    scene.add(face2D);
    scene.add(face3D);

    const ambientLight = new THREE.AmbientLight(0x0C0C0C);
    scene.add(ambientLight);

    let step = 0;
    const render = () => {
        step += 0.02;

        const cameraZ = 80 * Math.sin(step);
        camera.position.set(-100, 100, cameraZ);
        camera.lookAt(scene.position);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };

    render();
};

const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('load', handleLoad);
window.addEventListener('resize', handleResize);