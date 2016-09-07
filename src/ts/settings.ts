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

export const renderPipeline = {
    ssao: {
        enabled: false
    },
    shadow: {
        enabled: true,
        map: 2048,
        camera : {
            view: 5,
            // near: 5,
            far: 350
        }
    }
}

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

export const zoom = {
    threshold: 0.5,
    min: 3,
    max: 15,
    initial: 5,
    step: 0.25,  // when playing on keyboard
    deltaDivisor: 25
};

export const cameraRotationRadius = 5 * Math.SQRT2;
export const cameraHeight = 5;

export const animationDuration = 250;


export const paths = {
    levels: './assets/levels.json',
    objects: './assets/objects.json'
};

const paletteDefault = {
    "avatar.red": 0xe53935,
    "avatar.green": 0x4CAF50,
    "avatar.blue": 0x1E88E5,
    "avatar.orange": 0xFB8C00,
    "avatar.white": 0x90A4AE,
    "avatar.yellow": 0xFDD835,

    "tree.crown": 0x8D6E63,
    "tree.trunk": 0x66BB6A,

    "ground.light" : 0x90A4AE,
    "ground.dark" : 0x546E7A

    // ... 
}

export const palette = [paletteDefault];

