import { useEffect, useRef, useState } from "react";
import { createGraphics } from "./feature/grahphics";
import { MidiInputSelector } from "./feature/midi/input-selector";
import {
  createSelectableMidiInput,
  getMidiAccess,
} from "./feature/midi/message";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let dispose: (() => void) | null = null;
    (async () => {
      const access = await getMidiAccess();
      if (access === null) {
        return;
      }
      setMidiAccess(access);

      const graphics = await createGraphics(canvas);
      const midiInput = createSelectableMidiInput({
        handler: graphics.onMessage,
      });

      dispose = () => {
        graphics.dispose();
        midiInput.dispose();
      };

      setSelectedInputRef.current = midiInput.setSelectedInput;
    })();

    return () => {
      dispose?.();
    };
  }, []);

  const setSelectedInputRef = useRef<
    ((input: MIDIInput | null) => void) | null
  >(null);

  const handleInputChange = (input: MIDIInput | null) => {
    if (setSelectedInputRef.current) {
      setSelectedInputRef.current(input);
    }
  };

  return (
    <div className={"relative h-screen w-screen bg-black"}>
      <canvas ref={canvasRef} className={"h-full w-full"} />
      {midiAccess && (
        <MidiInputSelector
          midiAccess={midiAccess}
          onInputChange={handleInputChange}
        />
      )}
    </div>
  );
}
