import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import MapImage from "./assets/textures/Glass_Window_002_basecolor.jpg";
import MapAOImage from "./assets/textures/Glass_Window_002_ambientOcclusion.jpg";
import MapHeighImage from "./assets/textures/Glass_Window_002_height.png";
import MapNormalImage from "./assets/textures/Glass_Window_002_normal.jpg";
import MapRoughnessImage from "./assets/textures/Glass_Window_002_roughness.jpg";
import MapMetalicImage from "./assets/textures/Glass_Window_002_metallic.jpg";
import MapAlphaImage from "./assets/textures/Glass_Window_002_opacity.jpg";
import MapLightImage from "./assets/textures/Glass_Window_002_light.jpg";

class Graphics {
  constructor() {
    const divContainer = document.querySelector("#Webgl-container");
    this._divContainer = divContainer;

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => console.log("Rendering starts!");
    loadingManager.onLoad = () => console.log("Rendering is done!");

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
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 3;
    this._camera = camera;
    this._scene.add(camera);
  }

  _setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);

    const ambientLight = new THREE.AmbientLight(0x404040);

    // this._scene.add(light);
    // this._scene.add(ambientLight);

    this._camera.add(light);
    this._camera.add(ambientLight);
  }

  _setupModel() {
    const textureLoader = new THREE.TextureLoader();

    const map = textureLoader.load(MapImage);
    const mapAO = textureLoader.load(MapAOImage);
    const mapHeight = textureLoader.load(MapHeighImage);
    const mapNormal = textureLoader.load(MapNormalImage);
    const mapRoughness = textureLoader.load(MapRoughnessImage);
    const mapMetalic = textureLoader.load(MapMetalicImage);
    const mapAlpha = textureLoader.load(MapAlphaImage);
    const mapLight = textureLoader.load(MapLightImage);

    const material = new THREE.MeshStandardMaterial({
      map: map,

      normalMap: mapNormal,

      displacementMap: mapHeight,
      displacementScale: 0.2,
      displacementBias: -0.15,

      aoMap: mapAO,
      aoMapIntensity: 1,

      roughnessMap: mapRoughness,
      roughness: 0.5,

      metalnessMap: mapMetalic,
      metalness: 0.5,

      alphaMap: mapAlpha,
      // transparent: true,
      side: THREE.DoubleSide,

      lightMap: mapLight,
      lightMapIntensity: 1,
    });

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 256, 256, 256);
    const sphereGeometry = new THREE.SphereGeometry(0.7, 512, 512);

    const box = new THREE.Mesh(boxGeometry, material);
    box.geometry.attributes.uv2 = box.geometry.attributes.uv;
    box.position.set(-1, 0, 0);
    this._scene.add(box);

    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.geometry.attributes.uv2 = sphere.geometry.attributes.uv;
    sphere.position.set(1, 0, 0);
    this._scene.add(sphere);
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

  update(time) {}
}

window.onload = function () {
  new Graphics();
};

/*
    https://3dtextures.me/
    You can get texture images from the site above.
    This site provide every files for metallic, roughness, etc.
*/
