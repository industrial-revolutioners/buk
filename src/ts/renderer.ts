/**
 * renderer.ts
 *
 * Contains the main renderer functions
 *
 * @author Caiwan
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import { rendererSettings, canvasWrapper } from './settings';
import {camera, updateCamera} from './camera';
import {scene, cube} from './objects';

export let renderer = new THREE.WebGLRenderer(rendererSettings);
canvasWrapper.appendChild(renderer.domElement);

function setupSize() {
    updateCamera(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

setupSize();

window.addEventListener('resize', setupSize);

function renderScene():void {
    renderer.render(scene, camera);
}

function render():void {
    requestAnimationFrame(render);

    TWEEN.update();
    renderScene();
} 

render();
