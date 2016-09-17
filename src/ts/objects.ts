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
import * as Avatar from './avatar'
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
        this.renderer.shadowMap.enabled = SETTINGS.renderPipeline.shadow.enabled;
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
    public avatarAnimation: THREE.Object3D;
    public avatarOrientation: THREE.Object3D;
    private ground: THREE.Object3D;

    public dirLight: THREE.DirectionalLight;
    private ambientLight: THREE.AmbientLight;

    constructor(objContainer: ObjectContainer) {
        super();

        // window["lol"] = () => { this.exit(); };

        this.objContainer = objContainer;
        this.animations = new Animations(this);

        this.registerHandlers();

        /** Scenegraph for avatar:
         * + this.avatar
         *  ++ Ancor node
         *   ++ Animation node
         *    ++ Orientation node
         *     + Mesh
         */

        this.avatar = new THREE.Object3D();
        let avatarAnchor = new THREE.Object3D();
        this.avatarOrientation = new THREE.Object3D();
        this.avatarAnimation = new THREE.Object3D();

        this.avatar.add(avatarAnchor);
        avatarAnchor.add(this.avatarAnimation);
        this.avatarAnimation.add(this.avatarOrientation);
        this.avatarOrientation.add(this.objContainer.getObject("cube"));

        avatarAnchor.position.set(0, .5, 0);

        // --- setup lights
        this.dirLight = new THREE.DirectionalLight(0xcccccc, 1);
        this.dirLight.position.set(1, 1.25, -1);
        this.dirLight.position.multiplyScalar(50);

        this.dirLight.target = this.avatar;

        this.ambientLight = new THREE.AmbientLight(0x555555, 1);

        const shadowProps = SETTINGS.renderPipeline.shadow;

        if (shadowProps.enabled) {
            //? if(DEBUG){
            console.log("LightShadowProps:", shadowProps);
            //? }

            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = shadowProps.map;
            this.dirLight.shadow.mapSize.height = shadowProps.map;

            this.dirLight.shadow.camera.visible = true;

            let shadowCamera = <THREE.OrthographicCamera>(this.dirLight.shadow.camera);
            shadowCamera.left = -shadowProps.camera.view;
            shadowCamera.right = shadowProps.camera.view;
            shadowCamera.top = shadowProps.camera.view;
            shadowCamera.bottom = -shadowProps.camera.view;

            shadowCamera.far = shadowProps.camera.far;

            this.dirLight.shadow.bias = -0.0001;
        }
    }

    build(level: Level): void {
        const lw = level.width;
        const lh = level.height;

        // -- build ground tiles
        let levelNode = new THREE.Object3D();

        level.tileList.forEach((tileObject: Tiles.BaseTile) => {
            if (tileObject.type === "border")
                return;
                
            const px = tileObject.col;
            const py = tileObject.row;

            let tileNode = new THREE.Object3D();
            levelNode.add(tileNode);

            let tileName = "tile_" + tileObject.type;

            let tile: THREE.Mesh;

            if (tileObject.type === "gate" || tileObject.type === "finish" || tileObject.type === "bonus") {
                const color = (<Tiles.Gate>tileObject).getFaceName();
                tileName = tileName + "_" + color;
            }

            tile = this.objContainer.getObject(tileName);

            tileNode.add(tile.clone());
            tileNode.position.set(px, 0, py);
        });

        // one big thing under everything
        let geometry = new THREE.BoxGeometry(lw, .25, lh);
        let material = new THREE.MeshLambertMaterial({ color: this.objContainer.currentPalette["green"] });
        material.polygonOffset = true;
        material.polygonOffsetFactor = .05;
        material.polygonOffsetUnits = .0;
        let oneBigThing = new THREE.Mesh(geometry, material);
        oneBigThing.receiveShadow = SETTINGS.renderPipeline.shadow.enabled;
        oneBigThing.position.set(lw * .5 - .5, -.125, lh * .5 - .5);

        levelNode.add(oneBigThing);

        // -- build object atop of tiles

        let objectLayerNode = new THREE.Object3D();


        level.objects.forEach((levelObject: LevelObject) => {
            const px = levelObject.col;
            const py = levelObject.row;

            let object = this.objContainer.getObject(levelObject.name).clone();
            let objectNode = new THREE.Object3D();
            objectNode.add(object);
            objectNode.position.set(px, 0, py);

            objectLayerNode.add(objectNode);
        });

        // build scene
        this.scene = new THREE.Scene();

        this.scene.add(levelNode);
        this.scene.add(objectLayerNode);
        this.scene.add(this.avatar);

        this.scene.add(this.dirLight);
        this.scene.add(this.ambientLight);
    }

    exit() {
        this.scene = new THREE.Scene();
        this.startRendering();
    }
}


export class ObjectContainer {
    private objects: Object = {};
    private loader = new THREE.JSONLoader();

    public currentPalette = SETTINGS.palette[0];

    public getObject(name: string): THREE.Mesh {
        if (!this.objects.hasOwnProperty(name)) {
            throw "There is no object named " + name;
        }
        else return this.objects[name];
    }

    private duplicateObject(srcName: string, newname: string, overrideMaterial: Object) {
        {
            let dest = this.getObject(srcName).clone();
            let materials = dest.material = <THREE.MultiMaterial>dest.material.clone();
            this.overrideMaterials(materials.materials, overrideMaterial);
            dest.name = newname;
            this.objects[newname] = dest;
        }
    }

    private overrideMaterials(materials: THREE.Material[], nameMap: Object) {
        for (let i in materials) {
            let material = <THREE.MeshLambertMaterial>materials[i];

            if (this.currentPalette.hasOwnProperty(material.name) && nameMap.hasOwnProperty(material.name)) {
                const newname = nameMap[material.name];
                const color = this.currentPalette[newname];
                //? if(DEBUG){
                console.log("Replace material color " + material.name + " -> " + newname);
                //? }
                material.color.set(color);
                material.name = newname;

            }
        }
    }

    private lookupMaterials(materials: THREE.Material[]) {
        for (let i in materials) {
            const materialName = materials[i].name;
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

            object3d.castShadow = SETTINGS.renderPipeline.shadow.enabled;
            object3d.receiveShadow = SETTINGS.renderPipeline.shadow.enabled;

            object3d.name = objectData["name"];

            this.objects[object3d.name] = object3d;
        });

        this.duplicateObject("ground", "tile_border", {
            "ground.dark": "green"
        });

        // 'start' - mindig sarga := sarga gate  
        this.duplicateObject("ground", "tile_start", {
            "ground.dark": "avatar.yellow",
        });

        // 'base' - sima tile
        this.duplicateObject("ground", "tile_tile", {});

        // 'gate' - ebbol minden szinre kell majd 
        // TODO fucking do it
        for (let k in Avatar.stringToAvatarFace) {
            const v: number = Avatar.stringToAvatarFace[k];
            this.duplicateObject("ground", "tile_gate_" + v, {
                "ground.light": "avatar." + k,
            });
        }

        // 'finish' - ebbol minden szinre kell majd
        for (let k in Avatar.stringToAvatarFace) {
            const v: number = Avatar.stringToAvatarFace[k];
            this.duplicateObject("ground", "tile_finish_" + v, {
                "ground.light": "avatar." + k,
            });
        }


        // 'bonus' - ebbol ketto kell + cserelni kell majd oket
        for (let k in Avatar.stringToAvatarFace) {
            const v: number = Avatar.stringToAvatarFace[k];
            this.duplicateObject("ground", "tile_bonus_" + v, {
                "ground.dark": "avatar." + k,
            });
        }

        //? if(DEBUG){
        for (let i in this.objects) {
            console.log("object", i);
        }
        //? }
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
