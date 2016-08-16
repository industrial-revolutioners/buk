/**
 * Contains all the 3d object and scenes 
 */

import * as THREE from 'three';

export let scene = new THREE.Scene();

export let geometry = new THREE.BoxGeometry(1, 1, 1);
export let material = new THREE.MeshBasicMaterial({ color: 0x0080ff });
export let cube = new THREE.Mesh(geometry, material);

scene.add(cube);
