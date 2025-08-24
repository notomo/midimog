import type { MidiMessage } from "../lib/midi-input";

export interface Visualizer {
  onMidiMessage(message: MidiMessage): void;
  update(deltaTime: number): void;
  dispose(): void;
}
