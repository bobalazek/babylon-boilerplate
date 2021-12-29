import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Tools,
  Color3,
} from 'babylonjs';
import { SkyMaterial } from 'babylonjs-materials';

import {
  AbstractWorld,
  WorldInterface,
} from '../../Framework/Worlds/World';

export class DefaultWorld extends AbstractWorld {
  start() {
    super.start();

    this.scene.getEngine().displayLoadingUI();
  }

  load(): Promise<WorldInterface> {
    return new Promise((resolve) => {
      const playerCharacterId = 'player';

      this.prepareCamera();
      this.prepareLights();
      this.prepareEnvironment();
      this.preparePlayer(playerCharacterId);
      this.controller.posessTransformNode(
        this.scene.getMeshById(playerCharacterId)
      );

      // Hide preloader
      this.scene.getEngine().hideLoadingUI();

      resolve(this);
    });
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

    this.scene.activeCamera = camera;
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
    let skybox = MeshBuilder.CreateBox('skybox', {
      size: 1024,
    }, this.scene);
    var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.useSunPosition = true;
    skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
    skybox.material = skyboxMaterial;

    // Ground
    let ground = MeshBuilder.CreateGround('ground', {
      width: 128,
      height: 128,
    }, this.scene);
    let groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    ground.material = groundMaterial;
  }

  prepareInspector() {
    this.scene.debugLayer.show();
  }

  preparePlayer(playerCharacterId: string = 'player') {
    let playerCharacter = MeshBuilder.CreateCylinder(playerCharacterId, {
      height: 2,
    }, this.scene);
    playerCharacter.position.y = 1;
  }
}
