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

import {EventEmitter} from 'events';

import * as SETTINGS from './settings';
import * as THREE from 'three';
import * as Tiles from './tiles'
import {Animations} from './animations'
import {CameraModel} from './camera'
import {LevelObject, Level} from './levels'


export const RenderableEvents = {
    SETUP_SIZE: 'setupSize'
};


class Renderable extends EventEmitter {
    private renderer: THREE.WebGLRenderer;
    private animationHandle: number = null;

    public animations: Animations;
    public scene = new THREE.Scene();
    public camera: CameraModel;

    constructor() {
        super();

        this.camera = new CameraModel();

        this.renderer = new THREE.WebGLRenderer(SETTINGS.rendererSettings);

        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.renderReverseSided = false;
        SETTINGS.canvasWrapper.appendChild(this.renderer.domElement);
    }

    registerHandlers() {
        this.setupSize();

        window.addEventListener('resize', () => {
            this.setupSize();
        });
    }

    render(): void {
        this.animations.updateAnimations();
        this.renderer.render(this.scene, this.camera.camera);

        if (this.animations.isAnimationRunning()) {
            this.animationHandle = requestAnimationFrame(() => {
                this.render();
            });
        }
        else {
            cancelAnimationFrame(this.animationHandle);
            this.animationHandle = null;
        }
    }

    setupSize(): void {
        this.camera.updateCamera(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.emit(RenderableEvents.SETUP_SIZE);

        this.startRendering();
    }

    startRendering(): void {
        if (!this.animationHandle) {
            this.render();
        }
    }
}


export class Scene extends Renderable {
    private objContainer: ObjectContainer;
    public avatar: THREE.Object3D;
    private ground: THREE.Object3D;

    private dirLight: THREE.DirectionalLight;

    constructor(objContainer: ObjectContainer) {
        super();

        this.objContainer = objContainer;
        this.animations = new Animations(this);

        this.registerHandlers();

        // this.avatar = ... 

        // --- setup lights
        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.color.setHSL(0.1, 1, 0.95);
        this.dirLight.position.set(1, 1.25, -1);
        this.dirLight.position.multiplyScalar(50);
        // scene.add(dirLight);

        const shadowProps = SETTINGS.renderPipeline.shadow;

        if (shadowProps.enabled) {
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = shadowProps.map;
            this.dirLight.shadow.mapSize.height = shadowProps.map;

            let shadowCamera = <THREE.OrthographicCamera>(this.dirLight.shadow.camera);
            shadowCamera.left = -shadowProps.camera.view;
            shadowCamera.right = shadowProps.camera.view;
            shadowCamera.top = shadowProps.camera.view;
            shadowCamera.bottom = -shadowProps.camera.view;

            shadowCamera.far = shadowProps.camera.far;

            this.dirLight.shadow.bias = -0.0001;
        }

        // --- setup (temporal) ground
        var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
        var groundMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
        groundMat.color.setHSL(0.095, 1, 0.75);
        groundMat.name = "playfield.ground";
        groundMat.polygonOffset = true;
        groundMat.polygonOffsetFactor = -0.05;
        groundMat.polygonOffsetUnits = 1;

        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;

        // this.ground.position.y = -0.5;
        // scene.add(ground);

        this.ground.receiveShadow = shadowProps.enabled;

        // +++ cuccok
    }

    build(level: Level): void {
        // ... 

        this.scene = new THREE.Scene();
    }
}


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
        for (let i in SETTINGS.palette[0]) {
            const c = this.currentPalette[i];
            console.log("color " + i + " %c \u25a0 %c " + c.toString(16), "color:#" + c.toString(16), "color:0");
        }
        //? }

        objectsJson.forEach((objectData: Object) => {
            let meshData = this.loader.parse(objectData);
            this.lookupMaterials(meshData.materials);
            let object3d = new THREE.Mesh(meshData.geometry, new THREE.MultiMaterial(meshData.materials))
            object3d.receiveShadow = SETTINGS.renderPipeline.shadow.enabled;

            object3d.name = objectData["name"];

            this.objects.push(object3d);
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
