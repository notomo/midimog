import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
} from "three";
import { WebGPURenderer } from "three/webgpu";
import type { MidiMessage } from "./midi/message";
import { createGeometryVisualizer } from "./visualizer/geometry";

export async function createGraphics(canvas: HTMLCanvasElement) {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  await renderer.init();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  const ambientLight = new AmbientLight(0x404040, 0.6);

  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;

  const scene = new Scene();
  scene.add(ambientLight);
  scene.add(directionalLight);

  function handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  const visualizers = [createGeometryVisualizer(scene)];
  let animationId: number | null = null;
  let lastTime = 0;
  const animate = async (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    for (const visualizer of visualizers) {
      visualizer.update(deltaTime);
    }
    await renderer.renderAsync(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  return {
    onMessage: (message: MidiMessage) => {
      for (const visualizer of visualizers) {
        visualizer.onMessage(message);
      }
    },

    dispose(): void {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      for (const visualizer of visualizers) {
        visualizer.dispose();
      }

      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    },
  };
}
