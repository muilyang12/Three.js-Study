import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ammo from "./ammo.wasm.js";

let Ammo;

class Graphics {
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
    this._setupShot();

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
    this._createDomino();
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupShot() {
    const raycaster = new THREE.Raycaster();
    window.addEventListener("click", (e) => {
      if (!e.ctrlKey) {
        return;
      }

      const width = this._divContainer.clientWidth;
      const height = this._divContainer.clientHeight;
      const pt = {
        x: (e.clientX / width) * 2 - 1,
        y: -(e.clientY / height) * 2 + 1,
      };

      raycaster.setFromCamera(pt, this._camera);

      const tmpPos = new THREE.Vector3();
      tmpPos.copy(raycaster.ray.origin);

      const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z };
      const radius = 0.25;
      const quat = { x: 0, y: 0, z: 0, w: 1 };
      const mass = 1;

      const ballGeometry = new THREE.SphereBufferGeometry(radius);
      const ballMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        metalness: 0.7,
        roughness: 0.4,
      });
      const ball = new THREE.Mesh(ballGeometry, ballMaterial);

      ball.position.set(pos.x, pos.y, pos.z);
      this._scene.add(ball);

      const transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );
      const motionState = new Ammo.btDefaultMotionState(transform);

      const colShape = new Ammo.btSphereShape(radius);
      colShape.calculateLocalInertia(mass);

      const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        colShape
      );
      const body = new Ammo.btRigidBody(rbInfo);

      this._physicsWorld.addRigidBody(body);

      tmpPos.copy(raycaster.ray.direction);
      tmpPos.multiplyScalar(20);

      body.setLinearVelocity(new Ammo.btVector3(tmpPos.x, tmpPos.y, tmpPos.z));

      ball.physicsBody = body;
    });
  }

  _createTable() {
    const position = { x: 0, y: -0.525, z: 0 };
    const scale = { x: 30, y: 0.5, z: 30 };

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

  _createDomino() {
    const controlPoints = [
      [-10, 0, -10],
      [10, 0, -10],
      [10, 0, 10],
      [-10, 0, 10],
      [-10, 0, -8],
      [8, 0, -8],
      [8, 0, 8],
      [-8, 0, 8],
      [-8, 0, -6],
      [6, 0, -6],
      [6, 0, 6],
      [-6, 0, 6],
      [-6, 0, -4],
      [4, 0, -4],
      [4, 0, 4],
      [-4, 0, 4],
      [-4, 0, -2],
      [2, 0, -2],
      [2, 0, 2],
      [-2, 0, 2],
      [-2, 0, 0],
      [0, 0, 0],
    ];

    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const curve = new THREE.CatmullRomCurve3(
      controlPoints
        .map((point, index) => {
          if (index === controlPoints.length - 1) {
            return p0.set(...point);
          }

          p0.set(...point);
          p1.set(...controlPoints[(index + 1) % controlPoints.length]);

          return [
            new THREE.Vector3().copy(p0),
            new THREE.Vector3().lerpVectors(p0, p1, 0.3),
            new THREE.Vector3().lerpVectors(p0, p1, 0.7),
          ];
        })
        .flat(),
      false
    );

    // const points = curve.getPoints(1000);
    // const guideLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // const guideLineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    // const guideLine = new THREE.Line(guideLineGeometry, guideLineMaterial);
    // this._scene.add(guideLine);

    const scale = { x: 0.75, y: 1, z: 0.1 };
    const dominoGeometry = new THREE.BoxGeometry();
    const dominoMaterial = new THREE.MeshNormalMaterial();

    const step = 0.0001;
    let length = 0;

    const mass = 1;

    for (let i = 0; i < 1; i += step) {
      const point1 = curve.getPoint(i);
      const point2 = curve.getPoint(i + step);

      length += point1.distanceTo(point2);

      if (length > 0.3) {
        const domino = new THREE.Mesh(dominoGeometry, dominoMaterial);

        domino.position.copy(point1);
        domino.scale.set(scale.x, scale.y, scale.z);
        domino.lookAt(point2);

        domino.castShadow = true;
        domino.receiveShadow = true;
        this._scene.add(domino);

        // ==================================================
        // ==================================================

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(domino.rotation);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(point1.x, point1.y, point1.z));
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
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
          mass,
          motionState,
          colShape,
          localInertia
        );
        const body = new Ammo.btRigidBody(rbInfo);
        this._physicsWorld.addRigidBody(body);

        domino.physicsBody = body;

        length = 0;
      }
    }
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
