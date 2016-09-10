/**
 * settings.ts
 *
 * Defaults and constants for rendering and gesture handling
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />
import { WebGLRendererParameters } from 'three';
import { Storage } from './utils';

export let settingsStorage = new Storage('settings');

export let rendererSettings: WebGLRendererParameters = {
    alpha: true,
    antialias: settingsStorage.get('antialias', true)
};

export const renderPipeline = {
    ssao: {
        enabled: settingsStorage.get('ssaoEnabled', false)
    },
    shadow: {
        enabled: settingsStorage.get('shadowEnabled', true),
        map: settingsStorage.get('shadowMap', 2000),
        camera: {
            view: 20,
            near: -10,
            far: 1000
        }
    }
};

export let canvasWrapper: HTMLElement = document.getElementById('canvas-wrapper');

// Touch is in the rotate area if `touchX >= height * rotateAreaY`
export const rotateAreaY = 0.90;

export const swapRotation = settingsStorage.get('swapRotation', false);

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
    "avatar.white": 0xECEFF1,
    "avatar.yellow": 0xFDD835,

    "tree.trunk": 0x8D6E63,
    "tree.crown": 0x66BB6A,

    "bush.trunk": 0x5D4037,
    "bush.crown": 0x388E3C,

    "ground.light": 0x90A4AE,
    "ground.dark": 0x546E7A,
    "pinetree.trunk": 0x5D4037,
    "pinetree.crown": 0x33691E,

    "green": 0xAED581
    // ... 
};

export const palette = [paletteDefault];

export const loadDelay = 250;

export const finishDelay = 250;
