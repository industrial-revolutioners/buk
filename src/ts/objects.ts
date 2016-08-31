/**
 * objects.ts
 *
 * Contains all the 3d object and scenes
 *
 * @author Caiwan
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';

export let scene = new THREE.Scene();

// export const light0 = new THREE.DirectionalLight(0x66ffff, 0.7);
// scene.add(light0);
// light0.position.set(1, 3, 0);

// export const light1 = new THREE.DirectionalLight(0xffffcc, 0.7);
// scene.add(light1);
// light1.position.set(-1, 3, 0);

/** Builds up avatar model */
export class AvatarModel {
    public avatar: THREE.Object3D;

    constructor() {
        let loader = new THREE.ObjectLoader();

        // let geometry = new THREE.BoxGeometry(1, 1, 1);
        // let material = new THREE.MeshLambertMaterial({ color: 0x0080ff, overdraw: 0.5 });
        // let cube = new THREE.Mesh(geometry, material);
        // this.avatar = cube;

        let scene_: THREE.Scene;
        loader.load('assets/cube.json', (scene_: THREE.Scene) => {
            // this.avatar = <THREE.Mesh>scene_.getObjectByName("Cube");
            this.avatar = scene_;
            this.avatar.scale.set(.5, .5, .5);
            this.avatar.position.set(0, 0, 0);
            // this.avatar.material = material;

            console.log("cube", this.avatar);
        });
        setInterval(()=>{
            scene.add(this.avatar);
        },1000);
        
    }
}

export let avatarModel = new AvatarModel(); 
