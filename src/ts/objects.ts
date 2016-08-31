/**
 * objects.ts
 *
 * Contains all the 3d object and scenes
 *
 * @author Caiwan
 * @author Slapec
 */

import * as THREE from 'three';

export let scene = new THREE.Scene();

export const light0 = new THREE.AmbientLight(0xffffff);
scene.add(light0);

/** Builds up avatar model */
export class AvatarModel {
    public avatar: THREE.Mesh;

    constructor() {
        let loader = new THREE.JSONLoader();

        loader.load('assets/cube.json', (geometry, materials) => {
            this.avatar = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            this.avatar.scale.set(.5, .5, .5);
            scene.add(this.avatar);
            
            console.log(this.avatar);
        });
    }
}

export let avatarModel = new AvatarModel(); 
