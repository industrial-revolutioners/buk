/**
 * objects.ts
 *
 * Contains all the 3d object and scenes
 *
 * @author Caiwan
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';

// import {getAvaterColor} from './palette';

export let scene = new THREE.Scene();

export const light0 = new THREE.DirectionalLight(0x66ffff, 0.7);
scene.add(light0);
light0.position.set(1, 3, 0);

export const light1 = new THREE.DirectionalLight(0xffffcc, 0.7);
scene.add(light1);
light1.position.set(-1, 3, 0);

/** Builds up avatar model */
export class AvatarModel {
    public avatar: THREE.Mesh;

    constructor() {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshLambertMaterial({ color: 0x0080ff, overdraw: 0.5 });
        let cube = new THREE.Mesh(geometry, material);

        this.avatar = cube;
    }
}

export let avatarModel = new AvatarModel(); 

scene.add(avatarModel.avatar);
