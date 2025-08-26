import { useEffect, useState } from "react";

export function MidiInputSelector({
  midiAccess,
  onInputChange,
}: {
  midiAccess: MIDIAccess;
  onInputChange: (input: MIDIInput | null) => void;
}) {
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string>("");

  useEffect(() => {
    const updateInputs = () => {
      const inputArray = Array.from(midiAccess.inputs.values());
      setInputs(inputArray);

      // Auto-select first input if available
      if (inputArray.length > 0 && !selectedInputId) {
        const firstInput = inputArray[0];
        if (firstInput) {
          setSelectedInputId(firstInput.id);
          onInputChange(firstInput);
        }
      }
    };

    updateInputs();
    midiAccess.addEventListener("statechange", updateInputs);

    return () => {
      midiAccess.removeEventListener("statechange", updateInputs);
    };
  }, [midiAccess, onInputChange, selectedInputId]);

  const handleInputChange = (inputId: string) => {
    setSelectedInputId(inputId);
    if (inputId === "") {
      onInputChange(null);
    } else {
      const input = inputs.find((input) => input.id === inputId);
      onInputChange(input || null);
    }
  };

  if (inputs.length === 0) {
    return (
      <div className="absolute top-4 right-4 rounded bg-gray-800 px-3 py-2 text-sm text-white">
        No MIDI inputs available
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 rounded bg-gray-800 px-3 py-2 text-white">
      <select
        value={selectedInputId}
        onChange={(e) => handleInputChange(e.target.value)}
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
