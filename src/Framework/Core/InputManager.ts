import {
  InputBindingsInterface,
} from '../Gameplay/InputBindings';
import {
  InputModeEnum,
} from '../Input/InputConstants';
import {
  InputKeyboard,
} from '../Input/InputKeyboard';
import {
  InputMouse,
} from '../Input/InputMouse';
import {
  InputDeviceOrientation,
} from '../Input/InputDeviceOrientation';
import {
  InputGamepad,
} from '../Input/InputGamepad';
import {
  InputGamepadManager,
} from '../Input/InputGamepadManager';
import {
  AbstractInputBindings,
} from '../Gameplay/InputBindings';

export class InputManager {
  private _bindingsEnabled: boolean = false;
  private _bindings: InputBindingsInterface = new AbstractInputBindings();
  private _mode: InputModeEnum = InputModeEnum.KeyboardAndMouse;
  private _axes: { [key: string]: number } = {};
  private _actions: { [key: string]: boolean } = {};
  private _keyboard: InputKeyboard;
  private _mouse: InputMouse;
  private _deviceOrientation: InputDeviceOrientation;
  private _gamepadManager: InputGamepadManager;
  private _gamepads: Array<InputGamepad> = [];
  private _forcePointerLock: boolean = false;

  public isTouchDevice: boolean = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (<any>navigator).msMaxTouchPoints > 0
  );

  constructor() {
    this._keyboard = new InputKeyboard();
    this._mouse = new InputMouse();
    this._deviceOrientation = new InputDeviceOrientation();
    this._gamepadManager = new InputGamepadManager();
  }

  public setBindings(bindings: InputBindingsInterface) {
    this._bindingsEnabled = true;
    this._bindings = bindings;

    this._keyboard.setBindings(bindings);
    this._mouse.setBindings(bindings);
    this._deviceOrientation.setBindings(bindings);
    this._gamepadManager.setBindings(bindings);

    this.reset(true);
  }

  public bindEvents() {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener(
      'pointerlockchange',
      this._onPointerLockChange.bind(this),
      false
    );
    document.addEventListener(
      'mozpointerlockchange',
      this._onPointerLockChange.bind(this),
      false
    );

    this._keyboard.bindEvents();
    this._mouse.bindEvents();
    this._deviceOrientation.bindEvents();
    this._gamepadManager.bindEvents();
  }

  public unbindEvents() {
    if (typeof document === 'undefined') {
      return;
    }

    document.removeEventListener(
      'pointerlockchange',
      this._onPointerLockChange.bind(this),
      false
    );
    document.removeEventListener(
      'mozpointerlockchange',
      this._onPointerLockChange.bind(this),
      false
    );

    this._keyboard.unbindEvents();
    this._mouse.unbindEvents();
    this._deviceOrientation.unbindEvents();
    this._gamepadManager.unbindEvents();
  }

  public update() {
    if (!this._bindingsEnabled) {
      return;
    }

    this._keyboard.update();
    this._mouse.update();
    this._deviceOrientation.update();
    this._gamepadManager.update();
  }

  public afterRender() {
    this.reset();
  }

  public setMode(mode: InputModeEnum) {
    this._mode = mode;

    this.reset(true);
  }

  public setAxis(axis: string, scale: number) {
    this._axes[axis] = scale;
  }

  public addToAxis(axis: string, value: number) {
    this._axes[axis] += value;
  }

  public setAction(action: string, value: boolean) {
    this._actions[action] = value;
  }

  public setGamepad(index: number, gamepad: InputGamepad) {
    this._gamepads[index] = gamepad;
  }

  public setForcePointerLock(value: boolean) {
    this._forcePointerLock = value;
  }

  public reset(resetDevices: boolean = false) {
    this._axes = {};
    const axesKeys = Object.keys(this._bindings.axisMappings);
    for (let i = 0; i < axesKeys.length; i++) {
      this._axes[axesKeys[i]] = 0;
    }

    this._actions = {};
    const actionsKeys = Object.keys(this._bindings.actionMappings);
    for (let i = 0; i < actionsKeys.length; i++) {
      this._actions[actionsKeys[i]] = false;
    }

    if (resetDevices) {
      this._keyboard.reset();
      this._mouse.reset();
      this._deviceOrientation.reset();
      this._gamepadManager.reset();
    }
  }

  public get bindingsEnabled() {
    return this._bindingsEnabled;
  }

  public get bindings() {
    return this._bindings;
  }

  public get mode() {
    return this._mode;
  }

  public get axes() {
    return this._axes;
  }

  public get actions() {
    return this._actions;
  }

  public get mouse() {
    return this._mouse;
  }

  public get keyboard() {
    return this._keyboard;
  }

  public get gamepadManager() {
    return this._gamepadManager;
  }

  public get gamepads() {
    return this._gamepads;
  }

  public get forcePointerLock() {
    return this._forcePointerLock;
  }

  private _onPointerLockChange() {
    this.reset(true);
  }
}
