import {
  Observable,
} from 'babylonjs';

export class InputGamepad {
  public index: number;
  public data: Gamepad;
  public isConnected: boolean = false;
  public isXbox: boolean = false;
  public isXboxOne: boolean = false;

  public faceButtonsObservable = new Observable<{ a: boolean, b: boolean, x: boolean, y: boolean }>();
  public startBackButtonsObservable = new Observable<{ start: boolean, back: boolean }>();
  public buttonLeftStickObservable = new Observable<boolean>();
  public buttonRightStickObservable = new Observable<boolean>();
  public buttonLeftBumperObservable = new Observable<boolean>();
  public buttonRightBumperObservable = new Observable<boolean>();
  public dPadButtonsObservable = new Observable<{ up: boolean, down: boolean, left: boolean, right: boolean }>();
  public leftStickObservable = new Observable<{ x: number, y: number }>();
  public rightStickObservable = new Observable<{ x: number, y: number }>();
  public leftTriggerObservable = new Observable<number>();
  public rightTriggerObservable = new Observable<number>();

  private _buttonA: boolean = false;
  private _buttonB: boolean = false;
  private _buttonX: boolean = false;
  private _buttonY: boolean = false;
  private _buttonStart: boolean = false;
  private _buttonBack: boolean = false;
  private _buttonLeftStick: boolean = false;
  private _buttonRightStick: boolean = false;
  private _buttonLeftBumper: boolean = false;
  private _buttonRightBumper: boolean = false;
  private _buttonDPadUp: boolean = false;
  private _buttonDPadDown: boolean = false;
  private _buttonDPadLeft: boolean = false;
  private _buttonDPadRight: boolean = false;
  private _leftStickX: number = 0;
  private _leftStickY: number = 0;
  private _rightStickX: number = 0;
  private _rightStickY: number = 0;
  private _leftTrigger: number = 0;
  private _rightTrigger: number = 0;

  constructor(data: Gamepad) {
    this.data = data;
    this.index = data.index;
    this.isXbox = data.id.indexOf('Xbox') !== -1;
    this.isXboxOne = data.id.indexOf('Xbox One') !== -1;
  }

  public update() {
    if (this.isXboxOne) {
      this._setFaceButtons(
        this.data.buttons[0].pressed,
        this.data.buttons[1].pressed,
        this.data.buttons[2].pressed,
        this.data.buttons[4].pressed
      );
      this._setStartBackButtons(
        this.data.buttons[8].pressed,
        this.data.buttons[9].pressed
      );
      this._setButtonLeftStick(this.data.buttons[6].pressed);
      this._setButtonRightStick(this.data.buttons[7].pressed);
      this._setButtonLeftBumper(this.data.buttons[4].pressed);
      this._setButtonRightBumper(this.data.buttons[5].pressed);
      this._setDPadButtons(
        this.data.buttons[11].pressed,
        this.data.buttons[12].pressed,
        this.data.buttons[13].pressed,
        this.data.buttons[14].pressed
      );
      this._setLeftStick(
        this.data.axes[0],
        this.data.axes[1]
      );
      this._setRightStick(
        this.data.axes[3],
        this.data.axes[4]
      );
      this._setLeftTrigger(this.data.axes[2]);
      this._setRightTrigger(this.data.axes[5]);
    } else if (this.isXbox) {
      this._setFaceButtons(
        this.data.buttons[0].pressed,
        this.data.buttons[1].pressed,
        this.data.buttons[2].pressed,
        this.data.buttons[4].pressed
      );
      this._setStartBackButtons(
        this.data.buttons[9].pressed,
        this.data.buttons[8].pressed
      );
      this._setButtonLeftStick(this.data.buttons[10].pressed);
      this._setButtonRightStick(this.data.buttons[11].pressed);
      this._setButtonLeftBumper(this.data.buttons[4].pressed);
      this._setButtonRightBumper(this.data.buttons[5].pressed);
      this._setDPadButtons(
        this.data.buttons[12].pressed,
        this.data.buttons[13].pressed,
        this.data.buttons[14].pressed,
        this.data.buttons[15].pressed
      );
      this._setLeftStick(
        this.data.axes[0],
        this.data.axes[1]
      );
      this._setRightStick(
        this.data.axes[2],
        this.data.axes[3]
      );
      this._setLeftTrigger(this.data.buttons[6].value);
      this._setRightTrigger(this.data.buttons[7].value);
    } else {
      // TODO
    }
  }

  public reset() {
    this._setFaceButtons(
      false,
      false,
      false,
      false
    );
    this._setStartBackButtons(
      false,
      false
    );
    this._setButtonLeftStick(false);
    this._setButtonRightStick(false);
    this._setButtonLeftBumper(false);
    this._setButtonRightBumper(false);
    this._setDPadButtons(
      false,
      false,
      false,
      false
    );
    this._setLeftStick(
      0,
      0
    );
    this._setRightStick(
      0,
      0
    );
    this._setLeftTrigger(0);
    this._setRightTrigger(0);
  }

  private _setFaceButtons(a: boolean, b: boolean, x: boolean, y: boolean) {
    if (
      this._buttonA !== a ||
      this._buttonB !== b ||
      this._buttonX !== x ||
      this._buttonY !== y
    ) {
      this._buttonA = a;
      this._buttonB = b;
      this._buttonX = x;
      this._buttonY = y;

      this.faceButtonsObservable.notifyObservers({ a, b, x, y });
    }
  }

  private _setStartBackButtons(start: boolean, back: boolean) {
    if (
      this._buttonStart !== start ||
      this._buttonBack !== back
    ) {
      this._buttonStart = start;
      this._buttonBack = back;

      this.startBackButtonsObservable.notifyObservers({ start, back });
    }
  }

  private _setButtonLeftStick(value: boolean) {
    if (this._buttonLeftStick !== value) {
      this._buttonLeftStick = value;

      this.buttonLeftStickObservable.notifyObservers(value);
    }
  }

  private _setButtonRightStick(value: boolean) {
    if (this._buttonRightStick !== value) {
      this._buttonRightStick = value;

      this.buttonRightStickObservable.notifyObservers(value);
    }
  }

  private _setButtonLeftBumper(value: boolean) {
    if (this._buttonLeftBumper !== value) {
      this._buttonLeftBumper = value;

      this.buttonLeftBumperObservable.notifyObservers(value);
    }
  }

  private _setButtonRightBumper(value: boolean) {
    if (this._buttonRightBumper !== value) {
      this._buttonRightBumper = value;

      this.buttonRightBumperObservable.notifyObservers(value);
    }
  }

  private _setDPadButtons(up: boolean, down: boolean, left: boolean, right: boolean) {
    if (
      this._buttonDPadUp !== up ||
      this._buttonDPadDown !== down ||
      this._buttonDPadLeft !== left ||
      this._buttonDPadRight !== right
    ) {
      this._buttonDPadUp = up;
      this._buttonDPadDown = down;
      this._buttonDPadLeft = left;
      this._buttonDPadRight = right;

      this.dPadButtonsObservable.notifyObservers({ up, down, left, right });
    }
  }

  private _setLeftStick(x: number, y: number) {
    if (
      this._leftStickX !== x ||
      this._leftStickY !== y
    ) {
      this._leftStickX = x;
      this._leftStickY = y;

      this.leftStickObservable.notifyObservers({ x, y });
    }
  }

  private _setRightStick(x: number, y: number) {
    if (
      this._rightStickX !== x ||
      this._rightStickY !== y
    ) {
      this._rightStickX = x;
      this._rightStickY = y;

      this.rightStickObservable.notifyObservers({ x, y });
    }
  }

  private _setLeftTrigger(value: number) {
    if (this._leftTrigger !== value) {
      this._leftTrigger = value;

      this.leftTriggerObservable.notifyObservers(value);
    }
  }

  private _setRightTrigger(value: number) {
    if (this._rightTrigger !== value) {
      this._rightTrigger = value;

      this.rightTriggerObservable.notifyObservers(value);
    }
  }

  /***** Getters *****/
  public get buttonA() {
    return this._buttonA;
  }

  public get buttonB() {
    return this._buttonB;
  }

  public get buttonX() {
    return this._buttonX;
  }

  public get buttonY() {
    return this._buttonY;
  }

  public get buttonStart() {
    return this._buttonStart;
  }

  public get buttonBack() {
    return this._buttonBack;
  }

  public get buttonLeftStick() {
    return this._buttonLeftStick;
  }

  public get buttonRightStick() {
    return this._buttonRightStick;
  }

  public get buttonLeftBumper() {
    return this._buttonLeftBumper;
  }

  public get buttonRightBumper() {
    return this._buttonRightBumper;
  }

  public get buttonDPadUp() {
    return this._buttonDPadUp;
  }

  public get buttonDPadDown() {
    return this._buttonDPadDown;
  }

  public get buttonDPadLeft() {
    return this._buttonDPadLeft;
  }

  public get buttonDPadRight() {
    return this._buttonDPadRight;
  }

  public get leftStickX() {
    return this._leftStickX;
  }

  public get leftStickY() {
    return this._leftStickY;
  }

  public get rightStickX() {
    return this._rightStickX;
  }

  public get rightStickY() {
    return this._rightStickY;
  }

  public get leftTrigger() {
    return this._leftTrigger;
  }

  public get rightTrigger() {
    return this._rightTrigger;
  }
}
