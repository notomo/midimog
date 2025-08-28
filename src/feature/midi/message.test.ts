import { describe, expect, it } from "vitest";
import { parseMessage } from "./message";

describe("parseMessage", () => {
  it("should return null for data with less than 3 bytes", () => {
    expect(parseMessage(new Uint8Array([]))).toBeNull();
    expect(parseMessage(new Uint8Array([0x90]))).toBeNull();
    expect(parseMessage(new Uint8Array([0x90, 0x40]))).toBeNull();
  });

  it("should parse note_on messages", () => {
    const data = new Uint8Array([0x95, 0x40, 0x7f]);
    const result = parseMessage(data);

    expect(result).toEqual({
      type: "note_on",
      note: 0x40,
      velocity: 0x7f,
      channel: 5,
    });
  });

  it("should parse note_off messages", () => {
    const data = new Uint8Array([0x8a, 0x40, 0x40]);
    const result = parseMessage(data);

    expect(result).toEqual({
      type: "note_off",
      note: 0x40,
      velocity: 0x40,
      channel: 10,
    });
  });

  it("should parse control_change messages (0xb0)", () => {
    const data = new Uint8Array([0xb3, 0x07, 0x64]);
    const result = parseMessage(data);

    expect(result).toEqual({
      type: "control_change",
      control: 0x07,
      value: 0x64,
      channel: 3,
    });
  });

  it("should return null for unsupported message types", () => {
    const data = new Uint8Array([0xc0, 0x40, 0x00]); // Program change (unsupported)
    const result = parseMessage(data);

    expect(result).toBeNull();
  });
});
