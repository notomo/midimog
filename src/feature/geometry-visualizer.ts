import {
  BoxGeometry,
  Color,
  type Material,
  Mesh,
  MeshLambertMaterial,
  type Scene,
} from "three";
import type { MidiMessage } from "../lib/midi-input";
import type { Visualizer } from "./visualizer";

interface GeometryVisualizerState {
  scene: Scene;
  cubes: Mesh[];
  maxCubes: number;
}

export function createGeometryVisualizer(scene: Scene): Visualizer {
  const state: GeometryVisualizerState = {
    scene,
    cubes: [],
    maxCubes: 20,
  };

  function createCube(note: number, velocity: number): void {
    const geometry = new BoxGeometry(0.5, 0.5, 0.5);
    const hue = (note / 127) * 360;
    const intensity = velocity / 127;
    const color = new Color().setHSL(hue / 360, 1, 0.5);

    const material = new MeshLambertMaterial({
      color,
      transparent: true,
      opacity: intensity,
    });

    const cube = new Mesh(geometry, material);

    cube.position.x = (note - 64) / 10;
    cube.position.y = (Math.random() - 0.5) * 4;
    cube.position.z = (Math.random() - 0.5) * 4;

    cube.scale.setScalar(intensity);

    state.scene.add(cube);
    state.cubes.push(cube);

    if (state.cubes.length > state.maxCubes) {
      const oldCube = state.cubes.shift();
      if (oldCube) {
        state.scene.remove(oldCube);
        oldCube.geometry.dispose();
        (oldCube.material as Material).dispose();
      }
    }
  }

  return {
    onMidiMessage(message: MidiMessage): void {
      if (message.type === "note_on" && message.note && message.velocity) {
        createCube(message.note, message.velocity);
      }
    },

    update(deltaTime: number): void {
      for (const [index, cube] of state.cubes.entries()) {
        cube.rotation.x += deltaTime * (index + 1) * 0.01;
        cube.rotation.y += deltaTime * (index + 1) * 0.01;
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;

        const material = cube.material as MeshLambertMaterial;
        material.opacity *= 0.98;
      }
    },

    dispose(): void {
      for (const cube of state.cubes) {
        state.scene.remove(cube);
        cube.geometry.dispose();
        (cube.material as Material).dispose();
      }
      state.cubes.length = 0;
    },
  };
}
