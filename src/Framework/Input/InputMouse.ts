import {
  Observable,
} from 'babylonjs';

import {
  GameManager,
} from '../Core/GameManager';
import {
  InputDeviceInterface,
  InputMappingAxisMouseDataInterface,
  InputMappingActionMouseDataInterface,
  InputDeviceEnum,
  InputModeEnum,
  InputMouseAxisEnum,
  InputMouseButtonEnum,
} from './InputConstants';
import {
  InputBindingsInterface,
  AbstractInputBindings,
} from '../Gameplay/InputBindings';

export class InputMouse implements InputDeviceInterface {
  public moveObservable = new Observable<MouseEvent | PointerEvent>();
  public upDownObservable = new Observable<MouseEvent | PointerEvent>();
  public wheelObservable = new Observable<WheelEvent>();

  private _bindings: InputBindingsInterface = new AbstractInputBindings();
  private _axesMap: { [key: string]: InputMappingAxisMouseDataInterface } = {}; // ex.: [ moveForward: { axis: 0, scale: 1.0 } ]
  private _actionsMap: { [key: number]: string } = {}; // ex.: [ 0: interact ]; 0 = InputMouseButtonEnum.Left
  private _buttonsPressed: Array<number> = [];

  public setBindings(bindings: InputBindingsInterface) {
    this._bindings = bindings;

    // Attach actions
    this._actionsMap = {}
    for (const action in this._bindings.actionMappings) {
      const mappings = this._bindings.actionMappings[action];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Mouse) {
          continue;
        }

        const mappingData = <InputMappingActionMouseDataInterface>mappings[i].data;
        this._actionsMap[mappingData.button] = action;
      }
    }

    // Attach axes
    this._axesMap = {};
    for (const axis in this._bindings.axisMappings) {
      const mappings = this._bindings.axisMappings[axis];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Mouse) {
          continue;
        }

        this._axesMap[axis] = <InputMappingAxisMouseDataInterface>mappings[i].data;
      }
    }
  }

  public bindEvents() {
    GameManager.canvasElement.addEventListener(
      'mousemove',
      this._onHandleMove.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'pointermove',
      this._onHandleMove.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'mouseup',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'pointerup',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'mousedown',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'pointerdown',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.addEventListener(
      'wheel',
      this._onHandleWheel.bind(this),
      false
    );
  }

  public unbindEvents() {
    GameManager.canvasElement.removeEventListener(
      'mousemove',
      this._onHandleMove.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'pointermove',
      this._onHandleMove.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'mouseup',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'pointerup',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'mousedown',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'pointerdown',
      this._onHandleUpDown.bind(this),
      false
    );
    GameManager.canvasElement.removeEventListener(
      'wheel',
      this._onHandleWheel.bind(this),
      false
    );
  }

  public update() {}

  public reset() {
    this._buttonsPressed = [];
  }

  private _onHandleMove(e: MouseEvent | PointerEvent) {
    if (GameManager.engine.isPointerLock) {
      const deltaX = e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        e.msMovementX ||
        0;
      const deltaY = e.movementY ||
        e.mozMovementY ||
        e.webkitMovementY ||
        e.msMovementY ||
        0;

      const axisKeys = Object.keys(this._axesMap);
      for (let i = 0; i < axisKeys.length; i++) {
        const axis = axisKeys[i];
        const mouseAction = this._axesMap[axis];

        switch (mouseAction.axis) {
          case InputMouseAxisEnum.X: {
            if (deltaX !== 0) {
              GameManager.inputManager.addToAxis(axis, deltaX * mouseAction.scale);
            }
            break;
          }
          case InputMouseAxisEnum.Y: {
            if (deltaY !== 0) {
              GameManager.inputManager.addToAxis(axis, deltaY * mouseAction.scale);
            }
            break;
          }
        }
      }
    }

    this.moveObservable.notifyObservers(e);
  }

  private _onHandleUpDown(e: MouseEvent | PointerEvent) {
    const isPressed = e.type === 'mousedown' || e.type === 'pointerdown';

    // TODO: make sure those bindings are correct, especially in IE
    const button = e.which === 3
      ? InputMouseButtonEnum.Right
      : (e.which === 2
        ? InputMouseButtonEnum.Middle
        : (e.which === 1
          ? InputMouseButtonEnum.Left
          : null
        )
      );

    if (button === null) {
      return;
    }

    if (
      isPressed &&
      !GameManager.engine.isPointerLock &&
      GameManager.inputManager.forcePointerLock
    ) {
      GameManager.engine.enterPointerlock();
    }

    const action = typeof this._actionsMap[button] !== 'undefined'
      ? this._actionsMap[button]
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
      var index = this._buttonsPressed.indexOf(button);
      if (index === -1) {
        this._buttonsPressed.push(button);
      }
    } else {
      var index = this._buttonsPressed.indexOf(button);
      if (index > -1) {
        this._buttonsPressed.splice(index, 1);
      }
    }

    this.upDownObservable.notifyObservers(e);
  }

  private _onHandleWheel(e: WheelEvent) {
    const deltaY = e.deltaY;

    const axisKeys = Object.keys(this._axesMap);
    for (let i = 0; i < axisKeys.length; i++) {
      const axis = axisKeys[i];
      const mouseAction = this._axesMap[axis];

      if (
        deltaY !== 0 &&
        mouseAction.axis === InputMouseAxisEnum.Wheel
      ) {
        GameManager.inputManager.addToAxis(axis, deltaY * mouseAction.scale);
      }
    }

    this.wheelObservable.notifyObservers(e);
  }
}
