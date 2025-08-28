import {
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  type Scene,
} from "three";
import { disposeMeshes } from "../../lib/three/dispose";
import type { MidiMessage } from "../midi/message";

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

    if (cubes.length <= maxCubes) {
      return;
    }
    const oldCube = cubes.shift();
    if (!oldCube) {
      return;
    }
    disposeMeshes({ scene, meshes: [oldCube] });
  }

  return {
    onMessage: (message: MidiMessage) => {
      if (message.type !== "note_on") {
        return;
      }
      createCube(message.note, message.velocity);
    },

    update: (deltaTime: number) => {
      for (const [index, cube] of cubes.entries()) {
        cube.rotation.x += deltaTime * (index + 1) * 0.01;
        cube.rotation.y += deltaTime * (index + 1) * 0.01;
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;

        const material = cube.material as MeshLambertMaterial;
        material.opacity *= 0.98;
      }
    },

    dispose: () => {
      disposeMeshes({ scene, meshes: cubes });
      cubes.length = 0;
    },
  };
}
