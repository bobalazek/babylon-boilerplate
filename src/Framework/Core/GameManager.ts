import {
  Engine,
  EngineOptions,
  NullEngine,
  NullEngineOptions,
  Scene,
} from 'babylonjs';
import XMLHttpRequest from 'xhr2';

import { InputManager } from './InputManager';
import { ControllerInterface } from '../Gameplay/Controller';
import { InputBindingsInterface } from '../Gameplay/InputBindings';
import { SceneInterface } from '../Scenes/Scene';

export class GameManager {
  public static isServer: boolean = false;
  public static canvas: HTMLCanvasElement;
  public static engine: Engine;
  public static babylonScene: Scene;

  public static scene: SceneInterface;
  public static inputManager: InputManager;
  public static controller: ControllerInterface;

  public static parameters: any;

  public static boot(config: GameConfigInterface, parameters?: any): GameManager {
    if (config.isServer) {
      (<any>global).XMLHttpRequest = XMLHttpRequest;

      this.isServer = true;

      this.engine = new NullEngine(
        config.serverEngineOptions
      );
    } else {
      this.canvas = <HTMLCanvasElement>document.getElementById(config.canvasElementId);
      this.engine = new Engine(
        this.canvas,
        true,
        config.engineOptions,
        true
      );
    }

    // Parameters
    this.parameters = parameters;

    // Input manager
    this.inputManager = new InputManager();
    if (config.inputBindings) {
      this.inputManager.setBindings(
        new config.inputBindings()
      );
    }
    this.inputManager.bindEvents();

    // Scene & controller
    this.scene = new config.defaultScene();

    this.setController(new config.controller());
    this.setScene(this.scene);

    // Main render loop
    this.engine.runRenderLoop(() => {
      if (!this.babylonScene) {
        return;
      }

      this.inputManager.update();
      this.scene.update();
      this.babylonScene.render();
      this.inputManager.afterRender();
    });

    /***** Events *****/
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    window.addEventListener('focus', () => {
      this.inputManager.bindEvents();
    });

    window.addEventListener('blur', () => {
      this.inputManager.unbindEvents();
    });

    if (config.disableRightClick) {
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    return this;
  }

  public static setController(controller: ControllerInterface): GameManager {
    this.controller = controller;

    if (this.scene) {
      this.scene.setController(this.controller);
    }

    return this;
  }

  public static setScene(scene: SceneInterface): GameManager {
    this.scene = scene;

    this.prepareScene(this.scene);

    return this;
  }

  public static prepareScene(scene?: SceneInterface): Promise<GameManager> {
    if (!scene) {
      scene = this.scene;
    }

    if (!scene) {
      throw new Error('No scene set');
    }

    scene.setController(this.controller);
    scene.start();

    return new Promise((resolve) => {
      scene.load()
        .then((scene: SceneInterface) => {
          this.setBabylonScene(scene.babylonScene);

          scene.afterLoadObservable.notifyObservers(scene);

          resolve(this);
        });
    });
  }

  public static setBabylonScene(scene: Scene): GameManager {
    this.babylonScene = scene;

    return this;
  }

  public static isSupported(): boolean {
    return Engine.isSupported();
  }
}

export interface GameConfigInterface {
  defaultScene: new () => SceneInterface;
  controller?: new () => ControllerInterface;
  isServer?: boolean;
  canvasElementId?: string;
  engineOptions?: EngineOptions;
  serverEngineOptions?: NullEngineOptions;
  inputBindings?: new () => InputBindingsInterface;
  disableRightClick?: boolean;
}
