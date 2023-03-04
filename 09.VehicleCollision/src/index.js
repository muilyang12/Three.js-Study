import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ammo from "./ammo.wasm.js";
import { keysActions } from "./keyActions.js";

let Ammo;

class Graphics {
  tableThickness = 0.2;

  constructor() {
    const divContainer = document.querySelector("#Webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new THREE.Color(0xeeeeee), 1.0);
    renderer.shadowMap.enabled = true;

    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._clock = new THREE.Clock();

    this._setupCamera();
    this._setupLight();
    this._setupAmmo();
    this._setupControls();
    this._setupVehicleControl();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 20, 20);
    this._camera = camera;
  }

  _setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this._scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(-10, 15, 10);
    this._scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 15;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
  }

  _setupAmmo() {
    ammo
      .bind(window)()
      .then((res) => {
        Ammo = res;
        const overlappingPairCache = new Ammo.btDbvtBroadphase();
        const collisionConfiguration =
          new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(
          collisionConfiguration
        );
        const solver = new Ammo.btSequentialImpulseConstraintSolver();

        const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
          dispatcher,
          overlappingPairCache,
          solver,
          collisionConfiguration
        );
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0));

        this._physicsWorld = physicsWorld;

        this._setupModel();
      });
  }

  _setupModel() {
    this._createTable();
    this._createBoxStack();
    this._createVehicle();
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupVehicleControl() {
    const actions = {};

    window.addEventListener("keydown", (e) => {
      if (keysActions[e.code]) {
        e.preventDefault();
        e.stopPropagation();

        console.log(keysActions[e.code]);

        actions[keysActions[e.code]] = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (keysActions[e.code]) {
        e.preventDefault();
        e.stopPropagation();

        actions[keysActions[e.code]] = false;
      }
    });
  }

  _createTable() {
    const position = { x: 0, y: 0, z: 0 };
    const scale = { x: 30, y: this.tableThickness, z: 30 };

    const tableGeometry = new THREE.BoxGeometry();
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x878787 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);

    table.position.set(position.x, position.y, position.z);
    table.scale.set(scale.x, scale.y, scale.z);
    table.receiveShadow = true;

    this._scene.add(table);

    // ==================================================
    // ==================================================

    const quaternion = { x: 0, y: 0, z: 0, w: 1 };

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
      )
    );
    const motionState = new Ammo.btDefaultMotionState(transform);

    const colShape = new Ammo.btBoxShape(
      new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
    );
    const mass = 0;
    colShape.calculateLocalInertia(mass);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape
    );
    const body = new Ammo.btRigidBody(rbInfo);
    this._physicsWorld.addRigidBody(body);
  }

  _createBoxStack() {
    const zeroQuaternion = new THREE.Quaternion(0, 0, 0, 1);

    const numBoxes = 10;
    const boxSize = 1;
    for (let i = 0; i < numBoxes; i++) {
      for (let j = 0; j < numBoxes; j++) {
        this._createBox(
          new THREE.Vector3(
            i - boxSize * Math.floor(numBoxes / 2),
            j + this.tableThickness / 2,
            -5
          ),
          zeroQuaternion,
          boxSize,
          boxSize,
          boxSize
        );
      }
    }
  }

  _createBox(position, quaternion, width, height, depth) {
    const mass = 1;
    const friction = 1;

    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xfca400 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    box.position.copy(position);
    box.quaternion.copy(quaternion);

    box.castShadow = true;
    box.receiveShadow = true;
    this._scene.add(box);

    // ==================================================
    // ==================================================

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
      )
    );
    const motionState = new Ammo.btDefaultMotionState(transform);

    const aShape = new Ammo.btBoxShape(
      new Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5)
    );
    const localInertia = new Ammo.btVector3(0, 0, 0);
    aShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      aShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction);
    this._physicsWorld.addRigidBody(body);

    box.physicsBody = body;
  }

  _createVehicle() {
    const mass = 1;
    const friction = 1;

    const chassisWidth = 1.8;
    const chassisHeight = 0.6;
    const chassisDepth = 4;

    const chassisPosition = new THREE.Vector3(
      0,
      this.tableThickness / 2 + chassisHeight / 2,
      5
    );
    const chassisQuaternion = new THREE.Quaternion(0, 0, 0, 1);

    const chassisGeometry = new THREE.BoxGeometry(
      chassisWidth,
      chassisHeight,
      chassisDepth
    );
    const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);

    chassis.position.copy(chassisPosition);
    chassis.quaternion.copy(chassisQuaternion);

    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this._scene.add(chassis);

    // ==================================================
    // ==================================================

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(
      new Ammo.btVector3(
        chassisPosition.x,
        chassisPosition.y,
        chassisPosition.z
      )
    );
    transform.setRotation(
      new Ammo.btQuaternion(
        chassisQuaternion.x,
        chassisQuaternion.y,
        chassisQuaternion.z,
        chassisQuaternion.w
      )
    );
    const motionState = new Ammo.btDefaultMotionState(transform);

    const aShape = new Ammo.btBoxShape(
      new Ammo.btVector3(
        chassisWidth * 0.5,
        chassisHeight * 0.5,
        chassisDepth * 0.5
      )
    );
    const localInertia = new Ammo.btVector3(0, 0, 0);
    aShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      aShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction);
    this._physicsWorld.addRigidBody(body);

    chassis.physicsBody = body;

    this._vehicle = chassis;
  }

  update(time) {
    time *= 0.001;

    const deltaTime = this._clock.getDelta();

    if (this._physicsWorld) {
      this._physicsWorld.stepSimulation(deltaTime);
      this._scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return;
        }

        const objTHREE = object;
        const objAmmo = objTHREE.physicsBody;

        if (!objAmmo) {
          return;
        }

        const motionState = objAmmo.getMotionState();
        if (!motionState) {
          return;
        }

        let tmpTrans = this._tmpTrans;
        if (tmpTrans === undefined) {
          tmpTrans = this._tmpTrans = new Ammo.btTransform();
        }
        motionState.getWorldTransform(tmpTrans);

        const pos = tmpTrans.getOrigin();
        const quat = tmpTrans.getRotation();

        objTHREE.position.set(pos.x(), pos.y(), pos.z());
        objTHREE.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
      });
    }
  }

  render(time) {
    this._renderer.render(this._scene, this._camera);
    this.update(time);

    requestAnimationFrame(this.render.bind(this));
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }
}

window.onload = function () {
  new Graphics();
};
