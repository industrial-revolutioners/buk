import * as THREE from 'three';

import { renderer } from './renderer';
import { camera } from './camera';

let scene = new THREE.Scene();

let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
let cube = new THREE.Mesh(geometry, material);

scene.add(cube);

camera.position.z = 5;

let render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

render();
