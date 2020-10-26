import * as THREE from '/build/three.module.js';
export const scene = new THREE.Scene();
const LEG_WIDTH = 0.05;
const LEG_HEIGHT = 1.5;
const LEG_X = 0.8;
const LEG_Z = 0.3;
const faceGeometry = new THREE.BoxGeometry(2, 0.2, 1);
const legGeometry = new THREE.CylinderGeometry(LEG_WIDTH, LEG_WIDTH, LEG_HEIGHT, 32);
let faceMesh;
let leg1Mesh;
let leg2Mesh;
let leg3Mesh;
let leg4Mesh;
const faceMaterial = new THREE.MeshNormalMaterial();
const leg1Material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const leg2Material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const leg3Material = new THREE.MeshBasicMaterial({ color: 0x0f00f0 });
const leg4Material = new THREE.MeshBasicMaterial({ color: 0xf000ff });
init();
export function init() {
    faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    leg1Mesh = new THREE.Mesh(legGeometry, leg1Material);
    leg2Mesh = new THREE.Mesh(legGeometry, leg2Material);
    leg3Mesh = new THREE.Mesh(legGeometry, leg3Material);
    leg4Mesh = new THREE.Mesh(legGeometry, leg4Material);
    faceMesh.position.y = 0.8;
    leg1Mesh.position.x = LEG_X;
    leg1Mesh.position.z = LEG_Z;
    leg2Mesh.position.x = -LEG_X;
    leg2Mesh.position.z = -LEG_Z;
    leg3Mesh.position.x = -LEG_X;
    leg3Mesh.position.z = LEG_Z;
    leg4Mesh.position.x = LEG_X;
    leg4Mesh.position.z = -LEG_Z;
    scene.add(faceMesh);
    scene.add(leg1Mesh);
    scene.add(leg2Mesh);
    scene.add(leg3Mesh);
    scene.add(leg4Mesh);
}
export function render() {
    scene.rotation.x += 0.01;
    scene.rotation.y += 0.01;
}
