import { useEffect, useRef } from "react";
import type { MidiMotionGraphicsInstance } from "./feature/midi-motion-graphics";
import { createMidiMotionGraphics } from "./feature/midi-motion-graphics";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const midiMotionGraphicsRef = useRef<MidiMotionGraphicsInstance | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;

    createMidiMotionGraphics(canvasRef.current).then((midiMotionGraphics) => {
      if (disposed) {
        midiMotionGraphics.dispose();
        return;
      }

      midiMotionGraphicsRef.current = midiMotionGraphics;
      midiMotionGraphics.init();
    });

    return () => {
      disposed = true;
      if (midiMotionGraphicsRef.current) {
        midiMotionGraphicsRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className={"h-screen w-screen bg-black"}>
      <canvas ref={canvasRef} className={"h-full w-full"} />
    </div>
  );
}
