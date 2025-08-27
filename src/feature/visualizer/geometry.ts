import {
  BoxGeometry,
  Color,
  type Material,
  Mesh,
  MeshLambertMaterial,
  type Scene,
} from "three";
import type { MidiMessage } from "../../lib/midi-input";

export function createGeometryVisualizer(scene: Scene) {
  const cubes: Mesh[] = [];
  const maxCubes = 20;

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

    scene.add(cube);
    cubes.push(cube);

    if (cubes.length > maxCubes) {
      const oldCube = cubes.shift();
      if (oldCube) {
        scene.remove(oldCube);
        oldCube.geometry.dispose();
        (oldCube.material as Material).dispose();
      }
    }
  }

  return {
    onMessage(message: MidiMessage): void {
      if (message.type === "note_on" && message.note && message.velocity) {
        createCube(message.note, message.velocity);
      }
    },

    update(deltaTime: number): void {
      for (const [index, cube] of cubes.entries()) {
        cube.rotation.x += deltaTime * (index + 1) * 0.01;
        cube.rotation.y += deltaTime * (index + 1) * 0.01;
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;

        const material = cube.material as MeshLambertMaterial;
        material.opacity *= 0.98;
      }
    },

    dispose(): void {
      for (const cube of cubes) {
        scene.remove(cube);
        cube.geometry.dispose();
        (cube.material as Material).dispose();
      }
      cubes.length = 0;
    },
  };
}
