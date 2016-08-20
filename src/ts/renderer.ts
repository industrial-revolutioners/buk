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
import {camera} from './camera';
import {scene, cube} from './objects';

export let renderer = new THREE.WebGLRenderer(rendererSettings);
canvasWrapper.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

function renderScene():void {
    renderer.render(scene, camera);
}

function render():void {
    requestAnimationFrame(render);

    TWEEN.update();
    renderScene();
} 

render();
