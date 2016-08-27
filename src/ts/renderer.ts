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

import {rendererSettings, canvasWrapper} from './settings';
import {cameraModel} from './camera';
import {scene} from './objects';
import {
    updateAnimations, animationEvent,
    ANIMATION_START_EVT_NAME
} from './animations';

export let renderer = new THREE.WebGLRenderer(rendererSettings);
canvasWrapper.appendChild(renderer.domElement);

function setupSize() {
    cameraModel.updateCamera(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderScene();
}

setupSize();

window.addEventListener('resize', setupSize);

function renderScene(): void {
    renderer.render(scene, cameraModel.camera);
}

function render(): void {
    // if (
    updateAnimations();
    // )
    requestAnimationFrame(render);

    renderScene();
}

// animationEvent.on(ANIMATION_START_EVT_NAME, render);

render();
