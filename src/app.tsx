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
    <div className="flex h-screen w-screen flex-col bg-black">
      <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-4">
        <div className="pointer-events-auto">
          {midiAccess && graphics ? (
            <MidiInputSelector
              midiAccess={midiAccess}
              onMessage={graphics.onMessage}
            />
          ) : (
            <div className="text-white">MIDI access is not available</div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="h-full w-full flex-1" />
    </div>
  );
}
