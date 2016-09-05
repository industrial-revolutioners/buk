/**
 * objects.ts
 *
 * Contains all the 3d object and scenes
 *
 * @author Caiwan
 * @author Slapec
 */

import {paths} from './settings';

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';
import * as SETTINGS from './settings';
import * as Tiles from './tiles'
import {LevelObject} from './levels'
import {CameraModel} from './camera'
import {Animations} from './animations'


class Renderer {
    private renderer: THREE.WebGLRenderer;
    private animationHandle: number = null;

    constructor() {
        this.renderer = new THREE.WebGLRenderer(SETTINGS.rendererSettings);

        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.renderReverseSided = false;
        SETTINGS.canvasWrapper.appendChild(this.renderer.domElement);

        this.setupSize();
        window.addEventListener('resize', () => { this.setupSize(); });
    }

    render(): void {
        this.updateAnimations();
        this.renderer.render(scene.scene, cameraModel.camera);

        if (this.isAnimationRunning()) {
            this.animationHandle = requestAnimationFrame(render);
        }
        else {
            cancelAnimationFrame(animationHandle);
            animationHandle = null;
        }
    }

    setupSize(): void {
        this.cameraModel.updateCamera(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.input.update();

        startRendering();
    }

    startRendering(): void {
        if (!animationHandle) {
            render();
        }
    }

}

/**
 * 
 */
export class Scene extends Renderer{
    private objContainer: ObjectContainer
    public scene: THREE.Scene;
    public camera: CameraModel;
    public avatar: THREE.Object3D;
    public animations: Animations;

    constructor(objContainer: ObjectContainer) {
        super();
        this.objContainer = objContainer;
        this.animations = new Animations(this);
        this.camera = new CameraModel();

        // this.avatar = ... 

        // let dirLight = new THREE.DirectionalLight(0xffffff, 1);
        // dirLight.color.setHSL(0.1, 1, 0.95);
        // dirLight.position.set(1, 1.25, -1);
        // dirLight.position.multiplyScalar(50);
        // scene.add(dirLight);

        // dirLight.castShadow = true;
        // dirLight.shadow.mapSize.width = 2048;
        // dirLight.shadow.mapSize.height = 2048;

        // var d = 5;

        // let shadowCamera = <THREE.OrthographicCamera>(dirLight.shadow.camera);
        // shadowCamera.left = -d;
        // shadowCamera.right = d;
        // shadowCamera.top = d;
        // shadowCamera.bottom = -d;

        // shadowCamera.far = 350;

        // dirLight.shadow.bias = -0.0001;
        //dirLight.shadow.camera.visible = true;

        // var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
        // var groundMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
        // groundMat.color.setHSL(0.095, 1, 0.75);

        // var ground = new THREE.Mesh(groundGeo, groundMat);
        // ground.rotation.x = -Math.PI / 2;
        // ground.position.y = -0.5;
        // scene.add(ground);

        // ground.receiveShadow = true;

        // +++ cuccok
    }

    build(w: number, h: number, objects: LevelObject[], tiles: Tiles.BaseTile[]): void {
        // ... 

        this.scene = new THREE.Scene();
    }
}

/**
 * 
 */
export class ObjectContainer {
    public objects: THREE.Object3D[] = [];
    private loader = new THREE.JSONLoader();

    private currentPalette = SETTINGS.palette[0];

    private lookupMaterials(materials: THREE.Material[]) {
        for (let i in materials) {
            let material = <THREE.MeshLambertMaterial>materials[i];
            if (this.currentPalette.hasOwnProperty(material.name)) {
                const color = this.currentPalette[material.name];
                material.color.set(color);
            }
        }
    }

    constructor(objectsJson: Object[]) {

        //? if(DEBUG){
        // print color palette
        for (let i in SETTINGS.palette[0]) {
            const c = this.currentPalette[i];
            console.log("color " + i + " %c \u25a0 %c " + c.toString(16), "color:#" + c.toString(16), "color:0");
        }
        //? }

        objectsJson.forEach((objectData: Object) => {
            let meshData = this.loader.parse(objectData);
            this.lookupMaterials(meshData.materials);
            this.objects.push(new THREE.Mesh(meshData.geometry, new THREE.MultiMaterial(meshData.materials)));
        });
    }
}

/**
 * 
 */
export function loadObjects(path: string = paths.objects): Promise<any> {
    //? if(DEBUG){
    console.time('Objects.loadObjects');
    //? }

    return new Promise((resolve, reject) => {
        fetch(path)
            .then(response => {
                return response.json();
            })
            .then(objectsJson => {
                return resolve(new ObjectContainer(objectsJson));
            })
    })
}
