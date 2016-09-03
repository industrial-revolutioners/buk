/**
 * objects.ts
 *
 * Contains all the 3d object and scenes
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />
import * as THREE from 'three';

export let scene = new THREE.Scene();

export const light0 = new THREE.AmbientLight(0x555555);
scene.add(light0);


// let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
// hemiLight.color.setHSL(0.6, 1, 0.6);
// hemiLight.groundColor.setHSL(0.095, 1, 0.75);
// hemiLight.position.set(0, 500, 0);
// scene.add(hemiLight);

let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(1, 1.25, -1);
dirLight.position.multiplyScalar(50);
scene.add(dirLight);

// dirLight.castShadow = true;
// dirLight.shadow.mapSize.width = 2048;
// dirLight.shadow.mapSize.height = 2048;

var d = 5;

let shadowCamera = <THREE.OrthographicCamera>(dirLight.shadow.camera);
shadowCamera.left = -d;
shadowCamera.right = d;
shadowCamera.top = d;
shadowCamera.bottom = -d;

shadowCamera.far = 350;

dirLight.shadow.bias = -0.0001;
//dirLight.shadow.camera.visible = true;

var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
var groundMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
// groundMat.color.setHSL(0.095, 1, 0.75);

var ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

ground.receiveShadow = true;


/** Builds up avatar model */
export class AvatarModel {
    public avatar: THREE.Mesh;

    constructor() {
        let jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('assets/cube.json', (geometry, materials) => {
            this.avatar = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
            this.avatar.scale.set(.5, .5, .5);
            this.avatar.castShadow = true;
            this.avatar.receiveShadow = true;
            scene.add(this.avatar);
        });

        jsonLoader.load('assets/tree.json', (geometry, materials) => {
            let tree = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
            tree.position.x = -3;
            tree.position.y = -0.5;
            tree.castShadow = true;
            tree.receiveShadow = true;
            scene.add(tree);
        });
    }
}

export let avatarModel = new AvatarModel(); 
