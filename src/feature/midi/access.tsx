import { useEffect, useState } from "react";
import { MidiInputSelector } from "./input-selector";
import type { MidiMessage } from "./message";

export function MidiAccess({
  onMessage,
}: {
  onMessage: (message: MidiMessage) => void;
}) {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);

  useEffect(() => {
    (async () => {
      const access = await getMidiAccess();
      setMidiAccess(access);
    })();
  }, []);

  return (
    <div className="pointer-events-auto">
      {midiAccess ? (
        <MidiInputSelector midiAccess={midiAccess} onMessage={onMessage} />
      ) : (
        <div className="text-white">MIDI access is not available</div>
      )}
    </div>
  );
}

async function getMidiAccess() {
  if (!navigator.requestMIDIAccess) {
    return null;
  }
  return await navigator.requestMIDIAccess({ sysex: false });
}
