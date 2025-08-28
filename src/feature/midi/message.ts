export type MidiMessage =
  | {
      type: "note_on" | "note_off";
      note: number;
      velocity: number;
      channel: number;
    }
  | {
      type: "control_change";
      control: number;
      value: number;
      channel: number;
    };

export function parseMessage(data: Uint8Array): MidiMessage | null {
  if (data.length < 3) {
    return null;
  }

  const status = data[0] ?? 0;
  const channel = status & 0x0f;
  const command = status & 0xf0;

  switch (command) {
    case 0x90: // Note on
      return {
        type: "note_on",
        note: data[1] ?? 0,
        velocity: data[2] ?? 0,
        channel,
      };
    case 0x80: // Note off
      return {
        type: "note_off",
        note: data[1] ?? 0,
        velocity: data[2] ?? 0,
        channel,
      };
    case 0xb0: // Control change
      return {
        type: "control_change",
        control: data[1] ?? 0,
        value: data[2] ?? 0,
        channel,
      };
    default:
      return null;
  }
}
