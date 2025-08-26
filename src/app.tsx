import { useEffect, useRef } from "react";
import { createGraphics } from "./feature/midi-motion-graphics";
import { createMidiInput, getMidiAccess } from "./lib/midi-input";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let dispose: (() => void) | null = null;
    (async () => {
      const midiAccess = await getMidiAccess();
      if (midiAccess === null) {
        return;
      }

      const graphics = await createGraphics(canvas);
      const midiInput = createMidiInput({
        midiAccess,
        handler: graphics.onMidiMessage,
      });

      dispose = () => {
        graphics.dispose();
        midiInput.dispose();
      };
    })();

    return () => {
      dispose?.();
    };
  }, []);

  return (
    <div className={"h-screen w-screen bg-black"}>
      <canvas ref={canvasRef} className={"h-full w-full"} />
    </div>
  );
}
