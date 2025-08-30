import {
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  type Scene,
} from "three";
import { disposeMeshes } from "../../lib/three/dispose";
import type { MidiMessage } from "../midi/message";

function createCube(note: number, velocity: number): Mesh {
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

  return cube;
}

function updateCube(cube: Mesh, deltaTime: number, index: number): void {
  cube.rotation.x += deltaTime * (index + 1) * 0.01;
  cube.rotation.y += deltaTime * (index + 1) * 0.01;
  cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;

  const material = cube.material as MeshLambertMaterial;
  material.opacity *= 0.98;
}

const maxCubes = 20;

export function createGeometryVisualizer(scene: Scene) {
  const cubes: Mesh[] = [];

  return {
    onMessage: (message: MidiMessage) => {
      if (message.type !== "note_on") {
        return;
      }

      const cube = createCube(message.note, message.velocity);
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
    },

    update: (deltaTime: number) => {
      for (const [index, cube] of cubes.entries()) {
        updateCube(cube, deltaTime, index);
      }
    },

    dispose: () => {
      disposeMeshes({ scene, meshes: cubes });
      cubes.length = 0;
    },
  };
}
