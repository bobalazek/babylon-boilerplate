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
import { WorldInterface } from '../Worlds/World';

export class GameManager {
  public static isServer: boolean = false;
  public static canvas: HTMLCanvasElement;
  public static engine: Engine;
  public static scene: Scene;

  public static world: WorldInterface;
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

    // World & controller
    this.world = new config.defaultWorld();

    this.setController(new config.controller());
    this.setWorld(this.world);

    // Main render loop
    this.engine.runRenderLoop(() => {
      if (!this.scene) {
        return;
      }

      this.inputManager.update();
      this.world.update();
      this.scene.render();
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

    if (this.world) {
      this.world.setController(this.controller);
    }

    return this;
  }

  public static setWorld(world: WorldInterface): GameManager {
    this.world = world;

    this.prepareWorld(this.world);

    return this;
  }

  public static prepareWorld(world?: WorldInterface): Promise<GameManager> {
    if (!world) {
      world = this.world;
    }

    if (!world) {
      throw new Error('No world set');
    }

    world.setController(this.controller);
    world.start();

    return new Promise((resolve) => {
      world.load()
        .then((world: WorldInterface) => {
          this.setScene(world.scene);

          world.afterLoadObservable.notifyObservers(world);

          resolve(this);
        });
    });
  }

  public static setScene(scene: Scene): GameManager {
    this.scene = scene;

    return this;
  }

  public static isSupported(): boolean {
    return Engine.isSupported();
  }
}

export interface GameConfigInterface {
  defaultWorld: new () => WorldInterface;
  controller?: new () => ControllerInterface;
  isServer?: boolean;
  canvasElementId?: string;
  engineOptions?: EngineOptions;
  serverEngineOptions?: NullEngineOptions;
  inputBindings?: new () => InputBindingsInterface;
  disableRightClick?: boolean;
}
