import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class App {
  constructor() {
    const divContainer = document.querySelector("#Webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupControls();
    this._setupLight();
    this._setupModel();

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
    camera.position.set(10, 10, 0);
    camera.lookAt(0, 0, 0);

    this._camera = camera;
  }

  _setupLight() {
    const ambientLight = new THREE.AmbientLight(0xff0000, 0.5);

    const hemisphereLight = new THREE.HemisphereLight(0xb0d8f5, 0xbb7a1c, 1);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 7, 0);
    pointLight.distance = 5;
    this._scene.add(pointLight);
    this._pointLight = pointLight;

    const pointLightHelper = new THREE.PointLightHelper(pointLight);
    this._scene.add(pointLightHelper);
    this._pointLightHelper = pointLightHelper;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 5, 0);
    directionalLight.target.position.set(0, 0, 0);
    this._scene.add(directionalLight);
    this._scene.add(directionalLight.target);
    this._directionalLight = directionalLight;

    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight
    );
    this._scene.add(directionalLightHelper);
    this._directionalLightHelper = directionalLightHelper;

    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 3, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = THREE.MathUtils.degToRad(45);
    spotLight.penumbra = 0;
    spotLight.distance = 10;
    this._scene.add(spotLight);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    this._scene.add(spotLightHelper);
  }

  _setupModel() {
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaaterial = new THREE.MeshStandardMaterial({
      color: "#2C3E50",
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaaterial);
    ground.rotation.x = THREE.MathUtils.degToRad(-90);
    this._scene.add(ground);

    const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      roughness: 0.1,
      metalness: 0.2,
    });
    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
    this._scene.add(bigSphere);

    const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: "#9B59B6",
      roughness: 0.5,
      metalness: 0.9,
    });

    for (let i = 0; i < 8; i++) {
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.position.set(3, 0.5, 0);

      const torusPivot = new THREE.Object3D();
      torusPivot.rotation.y = THREE.MathUtils.degToRad((360 / 8) * i);
      torusPivot.add(torus);

      this._scene.add(torusPivot);
    }

    const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#E74C3C",
      roughness: 0.2,
      metalness: 0.5,
    });
    const smallSphere = new THREE.Mesh(
      smallSphereGeometry,
      smallSphereMaterial
    );
    smallSphere.position.set(3, 0.5, 0);

    const smallSpherePivot = new THREE.Object3D();
    smallSpherePivot.name = "smallSpherePivot";
    smallSpherePivot.add(smallSphere);

    this._scene.add(smallSpherePivot);
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
    time *= 0.001;

    const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 100);

      if (this._directionalLight.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._directionalLight.target.position);

        if (this._directionalLightHelper) {
          this._directionalLightHelper.update();
        }
      }
    }
  }
}

window.onload = function () {
  new App();
};
