import { useEffect, useState } from "react";
import type { MidiMessage } from "./message";
import { parseMessage } from "./message";

export function MidiInputSelector({
  midiAccess,
  onMessage,
}: {
  midiAccess: MIDIAccess;
  onMessage: (message: MidiMessage) => void;
}) {
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [selectedInputId, setSelectedInputId] = useState("");

  useEffect(() => {
    const selectedInput = inputs.find((input) => input.id === selectedInputId);
    if (!selectedInput) {
      return;
    }

    const listener = (event: MIDIMessageEvent) => {
      if (!event.data) {
        return;
      }

      const message = parseMessage(event.data);
      if (!message) {
        return;
      }

      onMessage(message);
    };
    selectedInput.addEventListener("midimessage", listener);
    return () => {
      selectedInput.removeEventListener("midimessage", listener);
    };
  }, [selectedInputId, inputs, onMessage]);

  useEffect(() => {
    const updateInputs = () => {
      const newInputs = Array.from(midiAccess.inputs.values());
      setInputs(newInputs);

      if (selectedInputId) {
        return;
      }

      const firstId = newInputs.at(0)?.id;
      if (!firstId) {
        return;
      }
      setSelectedInputId(firstId);
    };

    updateInputs();
    midiAccess.addEventListener("statechange", updateInputs);

    return () => {
      midiAccess.removeEventListener("statechange", updateInputs);
    };
  }, [midiAccess, selectedInputId]);

  if (inputs.length === 0) {
    return (
      <div className="rounded bg-gray-800 px-3 py-2 text-sm text-white">
        No MIDI inputs available
      </div>
    );
  }

  return (
    <div className="rounded bg-gray-800 px-3 py-2 text-white">
      <select
        value={selectedInputId}
        onChange={(e) => setSelectedInputId(e.target.value)}
        className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white"
      >
        <option value="">Select MIDI Input</option>
        {inputs.map((input) => (
          <option key={input.id} value={input.id}>
            {input.name || `Input ${input.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
