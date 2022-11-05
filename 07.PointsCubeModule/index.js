import * as THREE from '../libs/three.module.js';
import { OrbitControls } from '../libs/jsm/OrbitControls.js';

class Graphics {
    constructor() {
        const divContainer = document.querySelector('#Webgl-container');
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();

        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);
    }

    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            100
        );
        camera.position.z = 7;
        this._camera = camera;
    }
    
    _setupLight() {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);

        const ambientLight = new THREE.AmbientLight(0x404040);

        this._scene.add(light);
        this._scene.add(ambientLight);
    }

    _setupModel() {
        const vertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.Math.randFloatSpread(5);
            const y = THREE.Math.randFloatSpread(5);
            const z = THREE.Math.randFloatSpread(5);

            vertices.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        const sprite = new THREE.TextureLoader().load(
            '../imagesForParticles/snowflake01.png'
        );

        const material = new THREE.PointsMaterial({
            map: sprite,
            alphaTest: 0.5, // Only points having alpha value larger than alphaTest value can be rendered.
            
            color: 0x00FFFF,
            size: 0.1,
            sizeAttenuation: true, // false: the size of points is always same regardless of the distance from the camera.
        });

        const points = new THREE.Points(geometry, material);
        this._scene.add(points);
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);

        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        
    }
}

window.onload = function() {
    new Graphics();
}