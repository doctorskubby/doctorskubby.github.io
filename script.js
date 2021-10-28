import * as Three from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js?module';

function createCamera() {
  const camera = new Three.PerspectiveCamera(
    90, // fov = Field Of View
    1, // aspect ratio (dummy value)
    0.1, // near clipping plane
    100, // far clipping plane
  );
  camera.position.set(0, 0, 3);

  return camera;
}

function createScene() {
  const scene = new Three.Scene();
  const textureLoader = new Three.CubeTextureLoader();
  const textureCube = textureLoader.load( [
'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg', 'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg',
'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg', 'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg',
'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg', 'https://raw.githubusercontent.com/doctorskubby/nftestes/master/test/Cubes4.jpg'
] );
  scene.background = textureCube;
  
  return scene;
}

function createRenderer() {
  const renderer = new Three.WebGLRenderer({ antialias: true });
  renderer.physicallyCorrectLights = true;
  
  return renderer;
}

function createMoon() {
  const geometry = new Three.BoxGeometry( 2, 2, 2 );
  
  const textureLoader = new Three.TextureLoader();
  const texture = textureLoader.load(
   'https://raw.githubusercontent.com/jlankitus/nftestes/master/test/skubb.jpg');
  const material = new Three.MeshBasicMaterial({ 
    map: texture,
  });
  const moon = new Three.Mesh(geometry, material);
  const radiansPerSecond = Three.MathUtils.degToRad(15);
  
  moon.tick = (delta) => {
    moon.rotation.y += radiansPerSecond * delta;
  };
  
  return moon;
}

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minPolarAngle = 1.25; 
  controls.maxPolarAngle = 1.75;
  controls.tick = () => controls.update();
  
  return controls;
}

function setSize(container, camera, renderer) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
  constructor(container, camera, renderer) {
     setSize(container, camera, renderer);
     window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(container, camera, renderer);
    });
  }
}

const clock = new Three.Clock();

class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
    });
  }
  stop() {
    this.renderer.setAnimationLoop(null);
  }
  tick() {
    const delta = clock.getDelta();
    for(const object of this.updatables) {
    object.tick(delta);
    }
  }
}

class App {
  constructor(container) {
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    container.append(this.renderer.domElement);
    this.moon = createMoon();
    this.controls =  createControls(this.camera, this.renderer.domElement);
    this.loop.updatables.push(this.moon, this.controls);
    this.scene.add(this.moon);
    const resizer = new Resizer(container, this.camera, this.renderer);
  }
  start() {
    this.loop.start();
  }
  stop() {
    this.loop.stop();
  }
}

const container = document.querySelector('body');
const app = new App(container);
app.start();