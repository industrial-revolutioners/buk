/**
 * renderer.ts
 *
 * Contains the main renderer functions
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';

import { rendererSettings, canvasWrapper } from './settings';
import { cameraModel } from './camera';
import { scene } from './objects';
import { updateAnimations } from './animations';
import { input } from './input';

export let renderer = new THREE.WebGLRenderer(rendererSettings);
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.renderReverseSided = false;
canvasWrapper.appendChild(renderer.domElement);

function setupSize() {
    cameraModel.updateCamera(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    input.update();
}

setupSize();

window.addEventListener('resize', setupSize);

(function render(): void {
    renderer.render(scene, cameraModel.camera);
    updateAnimations();
    requestAnimationFrame(render);
})();
