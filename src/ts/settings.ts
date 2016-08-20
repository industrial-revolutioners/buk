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

export const frontRange: directionRange = {from: 0, to: 90};
export const backRange: directionRange = {from: 180, to: 270};
export const rightRange: directionRange = {from: 270, to: 360};
export const leftRange: directionRange = {from: 90, to: 180};

export const zoom = 0.1;
export const zoomThreshold = 0.4;
