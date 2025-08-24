import { useEffect, useRef } from "react";
import { createMidiMotionGraphics } from "./feature/midi-motion-graphics";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    let dispose: (() => void) | null = null;
    createMidiMotionGraphics(canvasRef.current)
      .then((x) => {
        dispose = x;
      })
      .catch((error) => {
        console.error("Failed to initialize MIDI Motion Graphics:", error);
      });

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
