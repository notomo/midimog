import type { Mesh, Scene } from "three";

export function disposeMeshes({
  scene,
  meshes,
}: {
  scene: Scene;
  meshes: Mesh[];
}) {
  for (const mesh of meshes) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of materials) {
      m.dispose();
    }
  }
}
