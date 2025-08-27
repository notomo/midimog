import { useEffect, useRef, useState } from "react";
import { createGraphics } from "./feature/grahphics";
import { MidiInputSelector } from "./feature/midi/input-selector";
import { getMidiAccess, type MidiMessage } from "./feature/midi/message";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [graphics, setGraphics] = useState<{
    onMessage: (message: MidiMessage) => void;
    dispose: () => void;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const access = await getMidiAccess();
      if (access !== null) {
        setMidiAccess(access);
      }
    })();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    (async () => {
      const graphicsObj = await createGraphics(canvas);
      setGraphics(graphicsObj);
    })();

    return () => {
      graphics?.dispose();
    };
  }, [graphics]);

  return (
    <div className={"relative h-screen w-screen bg-black"}>
      <canvas ref={canvasRef} className={"h-full w-full"} />
      {midiAccess && graphics && (
        <MidiInputSelector
          midiAccess={midiAccess}
          onMessage={graphics.onMessage}
        />
      )}
    </div>
  );
}
