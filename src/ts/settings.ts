/**
 * settings.ts
 *
 * Defaults and constants for rendering and gesture handling
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { WebGLRendererParameters } from 'three';

export let rendererSettings: WebGLRendererParameters = {
    alpha: true,
    antialias: true
};

export let canvasWrapper: HTMLElement = document.getElementById('canvas-wrapper');

// Touch is in the rotate area if `touchX >= height * rotateAreaY`
export const rotateAreaY = 0.90;

// Unit is pixel
export const rotateSwipeThreshold = 30;
export const moveSwipeThreshold = 70;

interface directionRange {
    from: number,
    to: number
}

export const frontRange: directionRange = { from: 0, to: 90 };
export const backRange: directionRange = { from: 180, to: 270 };
export const rightRange: directionRange = { from: 270, to: 360 };
export const leftRange: directionRange = { from: 90, to: 180 };

export const zoomLevelStep = 2;
export const zoomThreshold = 0.4; // Pinch distance treshold on touch event 
export const zoom = {min : 3, max: 15, default: 5};

export const cameraRotationRadius = 5 * Math.SQRT2;
export const cameraHeight = 5;

export const animationDuration = 250;
