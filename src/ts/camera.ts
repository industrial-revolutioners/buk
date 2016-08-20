/**
 * camera.ts
 *
 * Defines and exports the camera
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { PerspectiveCamera } from 'three';

export let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
