import type { MidiMessage } from "../lib/midi-input";
import { createGeometryVisualizer } from "./geometry-visualizer";
import { createWebGPURenderer } from "./renderer";

export async function createGraphics(canvas: HTMLCanvasElement) {
  const renderer = await createWebGPURenderer(canvas);

  const scene = renderer.scene;
  const visualizers = [createGeometryVisualizer(scene)];

  let animationId: number | null = null;
  let lastTime = 0;
  const animate = async (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    for (const visualizer of visualizers) {
      visualizer.update(deltaTime);
    }

    await renderer.render();
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  return {
    onMidiMessage: (message: MidiMessage) => {
      for (const visualizer of visualizers) {
        visualizer.onMidiMessage(message);
      }
    },
    dispose: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      for (const visualizer of visualizers) {
        visualizer.dispose();
      }
      renderer.dispose();
    },
  };
}
