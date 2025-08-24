export interface MidiMessage {
  type: "note_on" | "note_off" | "control_change";
  note?: number;
  velocity?: number;
  control?: number;
  value?: number;
  channel: number;
}

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

export async function createMidiInput(handler: (message: MidiMessage) => void) {
  if (!navigator.requestMIDIAccess) {
    throw new Error("Web MIDI API is not supported in this browser");
  }

  const access = await navigator.requestMIDIAccess({ sysex: false });
  for (const input of access.inputs.values()) {
    input.onmidimessage = (event) => {
      if (!event.data) {
        return;
      }

      const message = parseMessage(event.data);
      if (!message) {
        return;
      }

      handler(message);
    };
  }

  return {
    dispose(): void {
      for (const input of access.inputs.values()) {
        input.onmidimessage = null;
      }
    },
  };
}
