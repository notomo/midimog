import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
} from "three";
import { WebGPURenderer } from "three/webgpu";

export async function createWebGPURenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  await renderer.init();

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  function handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Setup renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);

  // Setup camera
  camera.position.z = 5;

  // Setup lights
  const ambientLight = new AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  handleResize();
  window.addEventListener("resize", handleResize);

  return {
    scene,
    camera,

    async render(): Promise<void> {
      await renderer.renderAsync(scene, camera);
    },

    dispose(): void {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    },
  };
}
