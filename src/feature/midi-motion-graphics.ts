import type { MidiInputInstance, MidiMessage } from "../lib/midi-input";
import { createMidiInput } from "../lib/midi-input";
import { createGeometryVisualizer } from "./geometry-visualizer";
import type { RendererInstance } from "./renderer";
import { createWebGPURenderer } from "./renderer";
import type { Visualizer } from "./visualizer";

export interface MidiMotionGraphicsInstance {
  init(): Promise<void>;
  dispose(): void;
}

interface MidiMotionGraphicsState {
  midiInput: MidiInputInstance | null;
  renderer: RendererInstance;
  visualizers: Visualizer[];
  animationId: number | null;
  lastTime: number;
}

export async function createMidiMotionGraphics(
  canvas: HTMLCanvasElement,
): Promise<MidiMotionGraphicsInstance> {
  const state: MidiMotionGraphicsState = {
    midiInput: null,
    renderer: createWebGPURenderer(canvas),
    visualizers: [],
    animationId: null,
    lastTime: 0,
  };

  function setupVisualizers(): void {
    const scene = state.renderer.getScene();

    state.visualizers = [createGeometryVisualizer(scene)];
  }

  function setupMidiHandlers(): void {
    if (!state.midiInput) return;

    state.midiInput.onMessage((message: MidiMessage) => {
      for (const visualizer of state.visualizers) {
        visualizer.onMidiMessage(message);
      }
    });
  }

  function startAnimation(): void {
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - state.lastTime) / 1000;
      state.lastTime = currentTime;

      for (const visualizer of state.visualizers) {
        visualizer.update(deltaTime);
      }

      state.renderer.render();
      state.animationId = requestAnimationFrame(animate);
    };

    state.animationId = requestAnimationFrame(animate);
  }

  return {
    async init(): Promise<void> {
      try {
        // Initialize WebGPU renderer first
        await state.renderer.init();

        // Try to initialize MIDI
        try {
          state.midiInput = await createMidiInput();
          setupMidiHandlers();
        } catch (midiError) {
          console.warn("MIDI initialization failed:", midiError);
        }

        setupVisualizers();
        startAnimation();
      } catch (error) {
        console.error("Failed to initialize MIDI Motion Graphics:", error);
        throw error;
      }
    },

    dispose(): void {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }

      for (const visualizer of state.visualizers) {
        visualizer.dispose();
      }

      if (state.midiInput) {
        state.midiInput.dispose();
      }
      state.renderer.dispose();
    },
  };
}
