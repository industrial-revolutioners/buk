/**
 * camera.ts
 *
 * Defines and exports the camera
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {PerspectiveCamera, OrthographicCamera, Vector3 } from 'three';

// export let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let camera = new OrthographicCamera(-1, 1, 1, -1, 0, 100);
// camera.position.set(5,5,5);
camera.position.set(5, 0, 0);
camera.lookAt(new Vector3(0, 0, 0));

camera.zoom = 1. / 3;

export function updateCamera(w: number, h: number): void {
    // --- orthographic camera
    let wh: number;
    let hw: number;

    if (w > h) {
        hw = h / w;
        wh = 1;
    } else {
        hw = 1;
        wh = w / h;
    }

    camera.top = hw;
    camera.bottom = -hw;
    camera.left = -wh;
    camera.right = wh;
    console.log("apsect:", wh, hw);

    // --- perspective camera
    // camera.aspect = w / h;

    camera.updateProjectionMatrix();
}

