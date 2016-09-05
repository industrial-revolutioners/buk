/**
 * renderer.ts
 *
 * This module contains the render loop.
 * It is an on-demand renderer meaning that the loop is off when no animations occur.
 * Animations are relatively rare and short so we save a lot of resource here.
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';

import {rendererSettings, canvasWrapper} from './settings';
import {cameraModel} from './camera';
import {scene} from './objects';
import {updateAnimations, isAnimationRunning} from './animations';
import {input} from './input';

export let renderer = new THREE.WebGLRenderer(rendererSettings);
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.renderReverseSided = false;
canvasWrapper.appendChild(renderer.domElement);


let animationHandle: number = null;
function render(){
    updateAnimations();
    renderer.render(scene, cameraModel.camera);

    if(isAnimationRunning()){
        animationHandle = requestAnimationFrame(render);
    }
    else {
        cancelAnimationFrame(animationHandle);
        animationHandle = null;
    }
}

function setupSize() {
    cameraModel.updateCamera(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    input.update();

    startRendering();
}

// setupSize();
// window.addEventListener('resize', setupSize);
animationHandle = requestAnimationFrame(render);

export function startRendering(){
    if(!animationHandle){
        render();
    }
}
