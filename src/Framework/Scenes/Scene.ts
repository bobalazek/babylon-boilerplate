import {
  Scene,
  Observable,
  Camera,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Tools,
  Color3,
} from 'babylonjs';
import { SkyMaterial } from 'babylonjs-materials';

import { ControllerInterface } from '../Gameplay/Controller';
import { GameManager } from '../Core/GameManager';

export interface SceneInterface {
  babylonScene: Scene;
  afterLoadObservable: Observable<SceneInterface>;
  controller: ControllerInterface;
  setController(controller: ControllerInterface): void;
  setActiveCamera(camera: Camera): void;
  start(): void;
  load(): Promise<any>;
  update(): void;
}

export abstract class AbstractScene implements SceneInterface {
  public babylonScene: Scene;
  public afterLoadObservable = new Observable<SceneInterface>();
  public controller: ControllerInterface;

  setController(controller: ControllerInterface) {
    this.controller = controller;
    this.controller.start();
  }

  setActiveCamera(camera: Camera) {
    this.babylonScene.activeCamera = camera;
  }

  start() {
    this.babylonScene = new Scene(GameManager.engine);
  }

  load() {
    return new Promise((resolve) => {
      // Show preloader
      GameManager.engine.displayLoadingUI();

      // Prepare scene
      this.prepareScene();

      // Hide preloader
      GameManager.engine.hideLoadingUI();

      resolve(this);
    });
  }

  update() {
    this.controller.update();
  }

  /***** Helpers *****/
  prepareScene() {
    this.prepareCamera();
    this.prepareLights();
    this.prepareEnvironment();
  }

  prepareCamera() {
    let camera = new ArcRotateCamera(
      'camera',
      Tools.ToRadians(0),
      Tools.ToRadians(60),
      10,
      Vector3.Zero(),
      this.babylonScene
    );

    camera.lowerBetaLimit = Tools.ToRadians(10);
    camera.upperBetaLimit = Tools.ToRadians(80);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 20;

    this.setActiveCamera(camera);
  }

  prepareLights() {
    new HemisphericLight(
      'light',
      Vector3.Up(),
      this.babylonScene
    );
  }

  prepareEnvironment() {
    // Skybox
    let skybox = Mesh.CreateBox('skybox', 1024, this.babylonScene);
    var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.babylonScene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.useSunPosition = true;
    skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
    skybox.material = skyboxMaterial;

    // Ground
    let ground = MeshBuilder.CreateGround('ground', {
      width: 16,
      height: 16,
    });
    let groundMaterial = new StandardMaterial('groundMaterial', this.babylonScene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    ground.material = groundMaterial;
  }

  prepareInspector() {
    this.babylonScene.debugLayer.show();
  }
}
