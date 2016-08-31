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
        let jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('assets/cube.json', (geometry, materials) => {
            this.avatar = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            this.avatar.scale.set(.5, .5, .5);
            scene.add(this.avatar);
        });

        jsonLoader.load('assets/tree.json', (geometry, materials) => {
            let tree = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            tree.position.x = -3;
            scene.add(tree);
        });
    }
}

export let avatarModel = new AvatarModel(); 
