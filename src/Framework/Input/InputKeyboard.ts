import {
  Observable,
} from 'babylonjs';

import {
  GameManager,
} from '../Core/GameManager';
import {
  InputDeviceInterface,
  InputMappingAxisKeyboardDataInterface,
  InputMappingActionKeyboardDataInterface,
  InputModeEnum,
  InputDeviceEnum,
} from './InputConstants';
import {
  InputBindingsInterface,
  AbstractInputBindings,
} from '../Gameplay/InputBindings';

export class InputKeyboard implements InputDeviceInterface {
  public keyUpDownObservable = new Observable<KeyboardEvent>();

  private _bindings: InputBindingsInterface = new AbstractInputBindings();
  private _axesKeyScaleMap: { [key: number]: { axis: string, scale: number } } = {}; // ex.: [ 68: { axis: 'moveForward', scale: 1 } ]
  private _actionsMap: { [key: number]: string } = {}; // ex.: { 68: moveForward }
  private _keysPressed: { [key: number]: number | undefined } = {}; // ex.: { 68: 123456789 /* unix time */ }

  public setBindings(bindings: InputBindingsInterface) {
    this._bindings = bindings;

    // Attach actions
    this._actionsMap = {};
    for (const action in this._bindings.actionMappings) {
      const mappings = this._bindings.actionMappings[action];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Keyboard) {
          continue;
        }

        const mappingData = <InputMappingActionKeyboardDataInterface>mappings[i].data;
        this._actionsMap[mappingData.keyCode] = action;
      }
    }

    // Attach axes
    this._axesKeyScaleMap = {};
    for (const axis in this._bindings.axisMappings) {
      const mappings = this._bindings.axisMappings[axis];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Keyboard) {
          continue;
        }

        const mappingData = <InputMappingAxisKeyboardDataInterface>mappings[i].data;
        this._axesKeyScaleMap[mappingData.keyCode] = {
          axis: axis,
          scale: mappingData.scale,
        };
      }
    }
  }

  public bindEvents() {
    GameManager.canvasElement.addEventListener(
      'keydown',
      this._onHandle.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'keyup',
      this._onHandle.bind(this),
      false
    );
  }

  public unbindEvents() {
    GameManager.canvasElement.removeEventListener(
      'keydown',
      this._onHandle.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'keyup',
      this._onHandle.bind(this),
      false
    );
  }

  public update() {
    for (const keyCode in this._keysPressed) {
      if (!this._keysPressed[keyCode]) {
        continue;
      }

      if (this._axesKeyScaleMap[keyCode]) {
        const axis = this._axesKeyScaleMap[keyCode].axis;
        const scale = this._axesKeyScaleMap[keyCode].scale;

        GameManager.inputManager.addToAxis(axis, scale);
      }
    }
  }

  public reset() {
    for (const keyCode in this._keysPressed) {
      this._keysPressed[keyCode] = undefined;
    }
  }

  public isKeyPressed(keyCode: number) {
    return typeof this._keysPressed[keyCode] === 'number';
  }

  public getKeysPressed() {
    let keysPressed = [];

    for (const keyCode in this._keysPressed) {
      if (!this._keysPressed[keyCode]) {
        continue;
      }

      keysPressed.push(keyCode);
    }

    return keysPressed;
  }

  private _onHandle(e: KeyboardEvent) {
    const isPressed = e.type === 'keydown';
    const keyCode = e.keyCode;
    const action = typeof this._actionsMap[keyCode] !== 'undefined'
        ? this._actionsMap[keyCode]
        : null;

    if (
      isPressed &&
      GameManager.inputManager.mode !== InputModeEnum.KeyboardAndMouse
    ) {
      GameManager.inputManager.setMode(
        InputModeEnum.KeyboardAndMouse
      );
    }

    if (action !== null) {
      GameManager.inputManager.setAction(action, isPressed);
    }

    if (isPressed) {
      this._keysPressed[keyCode] = (new Date()).getTime();
    } else {
      if (typeof this._keysPressed[keyCode] !== 'undefined') {
        this._keysPressed[keyCode] = undefined; // faster than just deleting
      }
    }

    this.keyUpDownObservable.notifyObservers(e);
  }
}
