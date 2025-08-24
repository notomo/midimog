import type { MidiMessage } from "../lib/midi-input";
import { createMidiInput } from "../lib/midi-input";
import { createGeometryVisualizer } from "./geometry-visualizer";
import { createWebGPURenderer } from "./renderer";

export interface MidiMotionGraphicsInstance {
  dispose(): void;
}

export async function createMidiMotionGraphics(
  canvas: HTMLCanvasElement,
): Promise<MidiMotionGraphicsInstance> {
  const renderer = createWebGPURenderer(canvas);
  await renderer.init();

  const scene = renderer.getScene();
  const visualizers = [createGeometryVisualizer(scene)];
  const midiInput = await createMidiInput((message: MidiMessage) => {
    for (const visualizer of visualizers) {
      visualizer.onMidiMessage(message);
    }
  });

  let animationId: number | null = null;
  let lastTime = 0;
  const animate = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    for (const visualizer of visualizers) {
      visualizer.update(deltaTime);
    }

    renderer.render();
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  return {
    dispose(): void {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      for (const visualizer of visualizers) {
        visualizer.dispose();
      }
      midiInput.dispose();
      renderer.dispose();
    },
  };
}
