import {
  Engine,
  EngineOptions,
  NullEngine,
  NullEngineOptions,
  Scene,
} from 'babylonjs';
import { XMLHttpRequest } from 'xhr2';

import {
  InputManager,
} from './InputManager';
import {
  ControllerInterface,
} from '../Gameplay/Controller';
import {
  InputBindingsInterface,
} from '../Gameplay/InputBindings';
import {
  WorldInterface,
} from '../Worlds/World';

export class GameManager {
  public static config: GameManagerConfigInterface;
  public static parameters: any;

  public static isServer: boolean = false;
  public static canvasElement: HTMLCanvasElement;
  public static engine: Engine;
  public static scene: Scene;

  public static world: WorldInterface;
  public static inputManager?: InputManager;
  public static controller?: ControllerInterface;

  public static boot(config: GameManagerConfigInterface, parameters?: any): GameManager {
    this.config = config;
    this.parameters = parameters;

    if (this.config.isServer) {
      (<any>global).XMLHttpRequest = XMLHttpRequest;

      this.isServer = true;

      this.engine = new NullEngine(
        this.config.serverEngineOptions
      );
    } else {
      this.canvasElement = this.config.canvasElement ?? null;
      if (!this.canvasElement) {
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'canvas';

        this.canvasElement = canvasElement;

        document.body.appendChild(this.canvasElement);
      }

      this.engine = new Engine(
        this.canvasElement,
        true,
        this.config.engineOptions,
        true
      );
    }

    // Parameters
    this.parameters = parameters;

    // Input manager
    if (config.inputBindings) {
      this.inputManager = new InputManager();
      this.inputManager.setBindings(
        new config.inputBindings()
      );
      this.inputManager.bindEvents();
    }

    // World & controller
    this.world = new config.defaultWorld();

    if (config.controller) {
      this.setController(new config.controller());
    }

    this.setWorld(this.world);

    // Main render loop
    this.engine.runRenderLoop(() => {
      if (!this.scene) {
        return;
      }

      if (this.inputManager) {
        this.inputManager.update();
      }

      this.world.update();
      this.scene.render();

      if (this.inputManager) {
        this.inputManager.afterRender();
      }
    });

    /***** Events *****/
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    if (this.inputManager) {
      window.addEventListener('focus', () => {
        this.inputManager.bindEvents();
      });

      window.addEventListener('blur', () => {
        this.inputManager.unbindEvents();
      });
    }

    if (this.config.disableRightClick) {
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

export interface GameManagerConfigInterface {
  defaultWorld: new () => WorldInterface;
  canvasElement?: HTMLCanvasElement;
  controller?: new () => ControllerInterface;
  isServer?: boolean;
  engineOptions?: EngineOptions;
  serverEngineOptions?: NullEngineOptions;
  inputBindings?: new () => InputBindingsInterface;
  disableRightClick?: boolean;
}
