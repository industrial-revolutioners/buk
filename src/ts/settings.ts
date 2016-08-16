import { WebGLRendererParameters } from 'three';

export let rendererSettings: WebGLRendererParameters = {
    alpha: true,
    antialias: true
};

export let canvasWrapper: HTMLElement = document.getElementById('canvas-wrapper');
