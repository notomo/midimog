import {
  AmbientLight,
  type Camera,
  DirectionalLight,
  type Object3D,
  PerspectiveCamera,
  Scene,
} from "three";
import { WebGPURenderer } from "three/webgpu";

export interface RendererInstance {
  addToScene(object: Object3D): void;
  removeFromScene(object: Object3D): void;
  render(): void;
  getScene(): Scene;
  getCamera(): Camera;
  dispose(): void;
}

interface RendererState {
  renderer: WebGPURenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}

export function createWebGPURenderer(
  canvas: HTMLCanvasElement,
): RendererInstance {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const state: RendererState = {
    renderer,
    scene,
    camera,
  };

  function handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height);
  }

  // Setup renderer
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(window.devicePixelRatio);
  state.renderer.setClearColor(0x000000, 0);

  // Setup camera
  state.camera.position.z = 5;

  // Setup lights
  const ambientLight = new AmbientLight(0x404040, 0.6);
  state.scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  state.scene.add(directionalLight);

  handleResize();
  window.addEventListener("resize", handleResize);

  return {
    addToScene(object: Object3D): void {
      state.scene.add(object);
    },

    removeFromScene(object: Object3D): void {
      state.scene.remove(object);
    },

    render(): void {
      state.renderer.render(state.scene, state.camera);
    },

    getScene(): Scene {
      return state.scene;
    },

    getCamera(): Camera {
      return state.camera;
    },

    dispose(): void {
      window.removeEventListener("resize", handleResize);
      state.renderer.dispose();
    },
  };
}
