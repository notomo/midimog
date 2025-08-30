import {
  Color,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  type Scene,
} from "three";
import { disposeMeshes } from "../../lib/three/dispose";
import type { MidiMessage } from "../midi/message";

type RippleRing = {
  mesh: Mesh;
  age: number;
  maxAge: number;
};

function createRipple(note: number, velocity: number): RippleRing {
  const innerRadius = 0.01;
  const outerRadius = 0.011;
  const geometry = new RingGeometry(innerRadius, outerRadius, 32);

  const hue = (note / 127) * 360;
  const color = new Color().setHSL(hue / 360, 1, 0.6);

  const material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: velocity / 127,
  });

  const mesh = new Mesh(geometry, material);

  mesh.position.x = (note - 64) / 8;
  mesh.position.y = (Math.random() - 0.5) * 2;
  mesh.position.z = 0;

  const maxAge = 1.5 + (velocity / 127) * 1.0;

  return {
    mesh,
    age: 0,
    maxAge,
  };
}

function updateRipple(ripple: RippleRing, deltaTime: number): void {
  ripple.age += deltaTime;
  const progress = ripple.age / ripple.maxAge;

  const scale = 1 + progress * 500;
  ripple.mesh.scale.setScalar(scale);

  const material = ripple.mesh.material as MeshBasicMaterial;
  material.opacity = (1 - progress) * 0.4;
}

const maxRipples = 10;

export function createRippleVisualizer(scene: Scene) {
  const ripples: RippleRing[] = [];

  return {
    onMessage: (message: MidiMessage) => {
      if (message.type !== "note_on") {
        return;
      }

      const ripple = createRipple(message.note, message.velocity);
      scene.add(ripple.mesh);
      ripples.push(ripple);

      if (ripples.length <= maxRipples) {
        return;
      }

      const oldRipple = ripples.shift();
      if (!oldRipple) {
        return;
      }
      disposeMeshes({ scene, meshes: [oldRipple.mesh] });
    },

    update: (deltaTime: number) => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        if (!ripple) continue;

        updateRipple(ripple, deltaTime);

        if (ripple.age >= ripple.maxAge) {
          disposeMeshes({ scene, meshes: [ripple.mesh] });
          ripples.splice(i, 1);
        }
      }
    },

    dispose: () => {
      const meshes = ripples.map((ripple) => ripple.mesh);
      disposeMeshes({ scene, meshes });
      ripples.length = 0;
    },
  };
}
