import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ammo from "./ammo.js";

let Ammo;

class Graphics {
  constructor() {
    this._setupAmmo();
  }

  _setupAmmo() {
    ammo
      .bind(window)()
      .then((res) => {
        Ammo = res;

        // One of the data structures storing potential collision pairs used in the Sweep and Prune (SAP) algorithm, which is one of the collision detection algorithms used in physics engines.
        const overlappingPairCache = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const collisionConfiguration =
          new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(
          collisionConfiguration
        );

        const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
          dispatcher,
          overlappingPairCache,
          solver,
          collisionConfiguration
        );
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0));

        this._physicsWorld = physicsWorld;

        this._rigidBodies = [];
        // The btTransform class in Ammo.js is used to represent the position and orientation of an object, as well as the relative position and orientation between objects in the physics engine.
        // this._tmpTrans = new Ammo.btTransform();
        // 이 부분이 왜 들어갔는지를 아직 이해하지 못했음. ㅠㅠ 좀 더 생각해봐야 할 듯.

        this._setupThreeJs();
        this._setupCamera();
        this._setupLight();
        // this._setupModel();
      });
  }

  _setupThreeJs() {
    const divContainer = document.querySelector("#Webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new THREE.Color(0xeeeeee), 1.0);
    // To render colors more accurately, the colors are processed using gamma-corrected values.
    renderer.outputEncoding = THREE.sRGBEncoding;

    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._clock = new THREE.Clock();
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10);
    camera.position.set(0, 0.6, -3.1);
    camera.lookAt(0, -2.0, 3.5);
    this._camera = camera;
  }

  _setupLight() {
    const color = 0xffffff;

    const ambientLight = new THREE.AmbientLight(color, 0.1);
    this._scene.add(ambientLight);

    const light = new THREE.DirectionalLight(color, 0.7);
    light.position.set(0, 2, -3.5);
    light.target.position.set(0, -0.4, 0.5);
    this._scene.add(light);
  }

  _setupModel() {
    new GLTFLoader().load();
  }

  _createStage() {}

  _createPins() {}

  _createDummyBall() {}

  update() {
    const deltaTime = this._clock.getDelta();
    this._updatePhysics(deltaTime);
  }

  _updatePhysics(deltaTime) {
    this._physicsWorld.stepSimulation(deltaTime, 10);

    this._rigidBodies.forEach((body) => {});
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    this.update();

    requestAnimationFrame(this.render.bind(this));
  }
}

window.onload = function () {
  new Graphics();
};
