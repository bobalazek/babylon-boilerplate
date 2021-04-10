import {
  Scene,
  Observable,
  Camera,
} from 'babylonjs';

import {
  ControllerInterface,
} from '../Gameplay/Controller';
import {
  GameManager,
} from '../Core/GameManager';

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
      // Do your own logic in sub-class here

      resolve(this);
    });
  }

  update() {
    this.controller.update();
  }
}
