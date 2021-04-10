import {
  GameManager,
} from '../Core/GameManager';
import {
  InputDeviceInterface,
  InputMappingAxisGamepadDataInterface,
  InputMappingActionGamepadDataInterface,
  InputModeEnum,
  InputDeviceEnum,
  InputGamepadAxisEnum,
  InputGamepadAxisPropertyEnum,
  InputGamepadButtonEnum,
  InputGamepadButtonPropertyEnum,
} from './InputConstants';
import {
  InputGamepad,
} from './InputGamepad';
import {
  InputBindingsInterface,
  AbstractInputBindings,
} from '../Gameplay/InputBindings';

export class InputGamepadManager implements InputDeviceInterface {
  public hasSupport: boolean = false;
  public isAnyConnected: boolean = false;

  private _bindings: InputBindingsInterface = new AbstractInputBindings();
  private _axesMap: { [key: string]: InputMappingAxisGamepadDataInterface } = {};
  private _actionsMap: { [key: string]: string } = {};
  private _actionsInversedMap: { [key: string]: number } = {}; // have the actions on the left & button on the right
  private readonly _axisDeadZone: number = 0.1;

  constructor() {
     if (typeof window !== 'undefined') {
       this.hasSupport = 'GamepadEvent' in window;
     }
  }

  public setBindings(bindings: InputBindingsInterface) {
    this._bindings = bindings;

    // Attach actions
    this._actionsMap = {};
    this._actionsInversedMap = {};
    for (const action in this._bindings.actionMappings) {
      const mappings = this._bindings.actionMappings[action];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Gamepad) {
          continue;
        }

        let mappingData = <InputMappingActionGamepadDataInterface>mappings[i].data;
        this._actionsMap[mappingData.button] = action;
        this._actionsInversedMap[action] = mappingData.button;
      }
    }

    // Attach axes
    this._axesMap = {};
    for (const axis in this._bindings.axisMappings) {
      const mappings = this._bindings.axisMappings[axis];
      for (let i = 0; i < mappings.length; i++) {
        if (mappings[i].device !== InputDeviceEnum.Gamepad) {
          continue;
        }

        this._axesMap[axis] = <InputMappingAxisGamepadDataInterface>mappings[i].data;
      }
    }
  }

  public bindEvents() {
    if (
      !this.hasSupport ||
      typeof window === 'undefined'
    ) {
      return;
    }

    window.addEventListener(
      'gamepadconnected',
      this._onHandle.bind(this),
      false
    );
    window.addEventListener(
      'gamepaddisconnected',
      this._onHandle.bind(this),
      false
    );
  }

  public unbindEvents() {
    if (
      !this.hasSupport ||
      typeof window === 'undefined'
    ) {
      return;
    }

    window.removeEventListener(
      'gamepadconnected',
      this._onHandle.bind(this),
      false
    );
    window.removeEventListener(
      'gamepaddisconnected',
      this._onHandle.bind(this),
      false
    );
  }

  public update() {
    this._updateGamepads();

    const gamepads = GameManager.inputManager.gamepads;
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad.isConnected) {
        continue;
      }

      gamepad.update();

      if (
        GameManager.inputManager.mode !== InputModeEnum.Gamepad &&
        (
          gamepad.buttonA ||
          gamepad.buttonB ||
          gamepad.buttonX ||
          gamepad.buttonY
        )
      ) {
        GameManager.inputManager.setMode(
          InputModeEnum.Gamepad
        );
      }

      if (GameManager.inputManager.mode === InputModeEnum.Gamepad) {
        // Axes
        for (const axis in this._bindings.axisMappings) {
          const axisData = this._axesMap[axis];
          if (axisData) {
            const actionAxis = axisData.axis;
            const actionScale = axisData.scale;
            const value = gamepad[
              InputGamepadAxisPropertyEnum[InputGamepadAxisEnum[actionAxis]]
            ];

            if (Math.abs(value) > this._axisDeadZone) {
              GameManager.inputManager.addToAxis(axis, value * actionScale);
            }
          }
        }

        // Actions
        for (const action in this._bindings.actionMappings) {
          const actionEnum = this._actionsInversedMap[action];
          if (!actionEnum) {
            continue;
          }

          const value = gamepad[
            InputGamepadButtonPropertyEnum[InputGamepadButtonEnum[actionEnum]]
          ];

          if (value) {
            GameManager.inputManager.setAction(action, value);
          }
        }
      }
    }
  }

  public reset() {
    const gamepads = GameManager.inputManager.gamepads;
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      gamepad.reset();
    }
  }

  private _onHandle(e: GamepadEvent) {
    const gamepads = GameManager.inputManager.gamepads;
    const gamepadIndex = e.gamepad.index;
    let gamepad = gamepads[gamepadIndex];
    if (!gamepad) {
      gamepad = new InputGamepad(e.gamepad);
    }

    gamepad.isConnected = e.type === 'gamepadconnected';

    GameManager.inputManager.setGamepad(
      gamepadIndex,
      gamepad
    );

    this.isAnyConnected = false;
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad.isConnected) {
        this.isAnyConnected = true;
        break;
      }
    }
  }

  private _updateGamepads() {
    if (typeof navigator === 'undefined') {
      return;
    }

    const browserGamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : (navigator.webkitGetGamepads
        ? navigator.webkitGetGamepads()
        : []
      );
    for (let i = 0; i < browserGamepads.length; i++) {
      const browserGamepad = browserGamepads[i];
      if (!browserGamepad) {
        continue;
      }

      let gamepad = GameManager.inputManager.gamepads[i];
      if (!gamepad) {
        gamepad = new InputGamepad(browserGamepad);
      }

      gamepad.data = browserGamepad;

      GameManager.inputManager.setGamepad(
        i,
        gamepad
      );
    }
  }
}
