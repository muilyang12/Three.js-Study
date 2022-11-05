let scene = null;
let camera = null;
let renderer = null;

const SNOWFLAKE_NUM = 500;

const handleLoad = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    renderer.setSize(1000, window.innerHeight);

    const textureLoader = new THREE.TextureLoader();
    const textures = [];
    textures.push(textureLoader.load('../imagesForParticles/snowflake01.png'));
    textures.push(textureLoader.load('../imagesForParticles/snowflake02.png'));
    textures.push(textureLoader.load('../imagesForParticles/snowflake03.png'));
    textures.push(textureLoader.load('../imagesForParticles/snowflake04.png'));

    for(let i = 0; i < SNOWFLAKE_NUM; i++) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [
            Math.random() * 15 - 7.5,
            Math.random() * 15 - 7.5,
            0,
        ];
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF, 
            map: textures[Math.floor(Math.random() * 4)],
            transparent: true,
            opacity: 1,
        });

        const point = new THREE.Points( geometry, material );

        scene.add(point);
    }
    
    const ambientLight = new THREE.AmbientLight(0x0C0C0C);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    camera.position.z = 10;
    camera.lookAt(scene.position);

    document.querySelector('#WebGL-output').appendChild(renderer.domElement);
    requestAnimationFrame(render);

    const velocityXMin = -0.005;
    const velocityXMax = 0.005;
    const velocityYMin = 0.015;
    const velocityYMax = 0.03;
    const velocity = [];
    for (let i = 0; i < SNOWFLAKE_NUM; i++) {
        const tempVelocity = [];
        tempVelocity.push(Math.random() * (velocityXMax - velocityXMin) + velocityXMin);
        tempVelocity.push(Math.random() * (velocityYMax - velocityYMin) + velocityYMin);
        velocity.push(tempVelocity);
    }

    function render() {
        for (let i = 0; i < SNOWFLAKE_NUM; i++) {
            const tempVelocity = velocity[i];
            scene.children[i].position.x += tempVelocity[0];
            scene.children[i].position.y -= tempVelocity[1];

            if (scene.children[i].position.y < -7) {
                scene.children[i].position.y = 7;
            }

            if (scene.children[i].position.x < -5) {
                velocity[i][0] *= -1;
            }

            else if (scene.children[i].position.x > 5) {
                velocity[i][0] *= -1;
            }
        }

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

window.addEventListener('load', handleLoad);