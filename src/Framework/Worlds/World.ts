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
  Tools,
  Color3,
} from 'babylonjs';
import { SkyMaterial } from 'babylonjs-materials';

import { ControllerInterface } from '../Gameplay/Controller';
import { GameManager } from '../Core/GameManager';

export interface WorldInterface {
  scene: Scene;
  afterLoadObservable: Observable<WorldInterface>;
  controller: ControllerInterface;
  setController(controller: ControllerInterface): void;
  setActiveCamera(camera: Camera): void;
  start(): void;
  load(): Promise<any>;
  update(): void;
}

export abstract class AbstractWorld implements WorldInterface {
  public scene: Scene;
  public afterLoadObservable = new Observable<WorldInterface>();
  public controller: ControllerInterface;

  setController(controller: ControllerInterface) {
    this.controller = controller;
    this.controller.start();
  }

  setActiveCamera(camera: Camera) {
    this.scene.activeCamera = camera;
  }

  start() {
    this.scene = new Scene(GameManager.engine);
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
      this.scene
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
      this.scene
    );
  }

  prepareEnvironment() {
    // Skybox
    let skybox = Mesh.CreateBox('skybox', 1024, this.scene);
    var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.useSunPosition = true;
    skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
    skybox.material = skyboxMaterial;

    // Ground
    let ground = MeshBuilder.CreateGround('ground', {
      width: 128,
      height: 128,
    });
    let groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    ground.material = groundMaterial;
  }

  prepareInspector() {
    this.scene.debugLayer.show();
  }
}
