import { WebGLRenderer } from 'three';

import { rendererSettings, canvasWrapper } from './settings';
import { camera } from './camera';

export let renderer = new WebGLRenderer(rendererSettings);
canvasWrapper.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    console.log('hey');
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});