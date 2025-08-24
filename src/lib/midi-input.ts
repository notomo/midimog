export interface MidiMessage {
  type: "note_on" | "note_off" | "control_change";
  note?: number;
  velocity?: number;
  control?: number;
  value?: number;
  channel: number;
}

export type MidiEventHandler = (message: MidiMessage) => void;

export interface MidiInputInstance {
  onMessage(handler: MidiEventHandler): void;
  removeHandler(handler: MidiEventHandler): void;
  dispose(): void;
}

interface MidiInputState {
  access: MIDIAccess | null;
  eventHandlers: MidiEventHandler[];
}

export async function createMidiInput(): Promise<MidiInputInstance> {
  if (!navigator.requestMIDIAccess) {
    throw new Error("Web MIDI API is not supported in this browser");
  }

  const state: MidiInputState = {
    access: null,
    eventHandlers: [],
  };

  function parseMessage(data: Uint8Array): MidiMessage | null {
    if (data.length < 2) return null;

    const status = data[0] ?? 0;
    const channel = status & 0x0f;
    const command = status & 0xf0;

    switch (command) {
      case 0x90: // Note on
        return {
          type: "note_on",
          note: data[1],
          velocity: data[2],
          channel,
        };
      case 0x80: // Note off
        return {
          type: "note_off",
          note: data[1],
          velocity: data[2],
          channel,
        };
      case 0xb0: // Control change
        return {
          type: "control_change",
          control: data[1],
          value: data[2],
          channel,
        };
      default:
        return null;
    }
  }

  function setupInputs(): void {
    if (!state.access) return;

    for (const input of state.access.inputs.values()) {
      input.onmidimessage = (event) => {
        if (event.data) {
          const message = parseMessage(event.data);
          if (message) {
            for (const handler of state.eventHandlers) {
              handler(message);
            }
          }
        }
      };
    }
  }

  try {
    state.access = await navigator.requestMIDIAccess();
    setupInputs();
  } catch (error) {
    throw new Error(`Failed to access MIDI: ${error}`);
  }

  return {
    onMessage(handler: MidiEventHandler): void {
      state.eventHandlers.push(handler);
    },

    removeHandler(handler: MidiEventHandler): void {
      const index = state.eventHandlers.indexOf(handler);
      if (index > -1) {
        state.eventHandlers.splice(index, 1);
      }
    },

    dispose(): void {
      if (state.access) {
        for (const input of state.access.inputs.values()) {
          input.onmidimessage = null;
        }
      }
      state.eventHandlers.length = 0;
    },
  };
}
