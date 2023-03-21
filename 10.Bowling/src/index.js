import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ammo from "./ammo.js";
import gsap from "gsap";

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
        // The btTransform class in Ammo.js is used to represent the position and orientation of an object in the physics engine.
        // this._tmpTrans = new Ammo.btTransform();
        // 이 부분이 왜 들어갔는지를 아직 이해하지 못했음. ㅠㅠ 좀 더 생각해봐야 할 듯.

        this._setupThreeJs();
        this._setupCamera();
        this._setupLight();
        // this._setupModel();

        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
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

  _createStage() {
    const models = this._models;

    const stageMesh = models.getObjectByName("Stage");

    const pos = { ...stageMesh.position };
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    const mass = 0;
    const friction = 0.5;
    const rollingFriction = 0.1;
    const restitution = 0.2;

    stageMesh.position.set(pos.x, pos.y, pos.z);
    this._scene.add(stageMesh);

    // ==================================================
    // ==================================================

    // The btTransform class in Ammo.js is used to represent the position and orientation of an object in the physics engine.
    const transform = new Ammo.btTransform();
    // Both the position and rotation information of the transform object to 0.
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(
      new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    // An interface for updating an object's position and orientation information and passing it to the rendering engine
    const motionState = new Ammo.btDefaultMotionState(transform);

    // colShape: Collision Shape
    const colShape = this._createAmmoShapeFromMesh(stageMesh);
    // The margin of the collision shape, which is an additional space around the collision shape that is used to prevent two collision shapes from overlapping with each other.
    colShape.setMargin(0.01);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(friction);
    body.setRollingFriction(rollingFriction);
    // Coefficient of restitution: The ratio of the final to initial relative speed between two objects after they collide
    body.setRestitution(restitution);

    this._physicsWorld.addRigidBody(body);
  }

  _createPins() {
    const models = this._models;

    const pin = models.getObjectByName("Pin");

    const quat = { x: 0, y: 0, z: 0, w: 1 };

    const mass = 1;

    const colShape = this._createAmmoShapeFromMesh(pin);
    colShape.setMargin(0.01);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    for (let i = 0; i < 10; i++) {
      const pinMesh = pin.clone();
      const name = `Pin_Pos_${i + 1}`;
      pinMesh.name = name;

      const posObj = models.getObjectByName(name);
      const pos = {
        x: posObj.position.x,
        y: posObj.position.y + 0.2,
        z: posObj.position.z,
      };
      pinMesh.position.copy(pos);
      this._scene.add(pinMesh);

      const transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );
      const motionState = new Ammo.btDefaultMotionState(transform);

      const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        colShape,
        localInertia
      );
      const body = new Ammo.btRigidBody(rbInfo);

      body.setFriction(0.4);
      body.setRollingFriction(0.1);
      body.setRestitution(1);

      this._physicsWorld.addRigidBody(body);

      pinMesh.userData.physicsBody = body;
      this._rigidBodies.push(pinMesh);
    }
  }

  _createDummyBall() {
    const models = this._models;

    const ballMesh = models.getObjectByName("Ball");

    const pos = { x: 0, y: 0.2, z: -2.4 };
    ballMesh.position.set(pos.x, pos.y, pos.z);

    this._scene.add(ballMesh);

    this._ball = ballMesh;

    gsap.fromTo(
      mesh.position,
      { x: 0.6 },
      {
        x: -0.6,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        // The rate of change during the animation, giving it a specific feel.
        ease: "power2.inOut",
      }
    );
  }

  update() {
    const deltaTime = this._clock.getDelta();
    this._updatePhysics(deltaTime);
  }

  _updatePhysics(deltaTime) {
    this._physicsWorld.stepSimulation(deltaTime, 10);

    let pos;
    let qua;
    this._rigidBodies.forEach((body) => {
      const objThree = body;
      const objAmmo = objThree.userData.physicsBody;

      const motionState = objAmmo.getMotionState();
      if (motionState) {
        motionState.getWorldTransform(this._tmpTrans);
        pos = this._tmpTrans.getOrigin();
        qua = this._tmpTrans.getRotation();

        objThree.position.set(pos.x(), pos.y(), pos.z());
        objThree.quaternion.set(qua.x(), qua.y(), qua.z(), qua.w());
      }
    });
  }

  _setupEvents() {
    this._mouseY = 0;
    this._prevMouseY = 0;

    window.addEventListener("mousemove", (event) => {
      this._prevMouseY = this._mouseY;
      this._mouseY = event.clientY;
    });

    window.addEventListener("mouseup", () => {
      const power = this._prevMouseY - this._mouseY;

      if (power < 1) return;

      const posNewBall = {
        x: this._ball.position.x,
        y: this._ball.position.y,
        z: this._ball.position.z,
      };
      this._scene.remove(this._ball);
      this._createBall(posNewBall, power);
    });
  }

  _createBall(pos, power) {
    const ballMesh = this._ball.clone();
    ballMesh.position.set(pos.x, pos.y, pos.z);
    this._scene.add(ballMesh);

    // ==================================================
    // ==================================================

    const quat = { x: 0, y: 0, z: 0, w: 1 };
    const mass = 3;

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(
      new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );

    const motionState = new Ammo.btDefaultMotionState(transform);

    const colShape = this._createAmmoShapeFromMesh(ballMesh);
    colShape.setMargin(0.01);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(0.5);
    body.setRollingFriction(0.05);
    body.setRestitution(0.9);

    this._physicsWorld.addRigidBody(body);

    ballMesh.userData.physicsBody = body;
    this._rigidBodies.push(ballMesh);

    // ==================================================
    // ==================================================

    const force = new Ammo.btVector3(0, 0, power * 3);
    const targetPos = new Ammo.btVector3(0.2, 0.2, 0);
    body.applyForce(force, targetPos);

    gsap.to(this._camera.position, {
      delay: 1.5,
      duration: 3,
      z: 1,
      ease: "power2.out",
      onComplete: () => this._showTryAgainButton(true),
    });
  }

  _showTryAgainButton(isShown) {}

  render() {
    this._renderer.render(this._scene, this._camera);
    this.update();

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
