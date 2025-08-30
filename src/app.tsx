import { useEffect, useRef, useState } from "react";
import { createGraphics, type Graphics } from "./feature/grahphics";
import { MidiAccess } from "./feature/midi/access";

export function App() {
  const [graphics, setGraphics] = useState<Graphics | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: HACK: to enable hot reloading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const graphics = createGraphics(canvas);
    setGraphics(graphics);

    return () => {
      graphics?.dispose();
    };
  }, [createGraphics]);

  return (
    <div className="h-screen w-screen bg-black">
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-end p-4">
        {graphics ? <MidiAccess onMessage={graphics.onMessage} /> : null}
      </div>
      <canvas ref={canvasRef} className="h-full w-full flex-1" />
    </div>
  );
}
