import {
  Key as KeyboardKey,
} from 'ts-keycode-enum';

/********** Interfaces **********/
export interface InputDeviceInterface {
  bindEvents(): void;
  unbindEvents(): void;
  update(): void;
  reset(): void;
}

export interface InputMappingInterface {
  device: InputDeviceEnum;
  data: any;
}

export interface InputMappingDataInterface {
  scale: number;
}

export interface InputMappingAxisKeyboardDataInterface extends InputMappingDataInterface {
  keyCode: KeyboardKey;
}

export interface InputMappingAxisKeyboardInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingAxisKeyboardDataInterface;
}

export interface InputMappingAxisGamepadDataInterface extends InputMappingDataInterface {
  axis: InputGamepadAxisEnum;
}

export interface InputMappingAxisGamepadInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingAxisGamepadDataInterface;
}

export interface InputMappingAxisMouseDataInterface extends InputMappingDataInterface {
  axis: InputMouseAxisEnum;
  scale: number;
}

export interface InputMappingAxisMouseInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingAxisMouseDataInterface;
}

export interface InputMappingActionKeyboardDataInterface extends InputMappingDataInterface {
  keyCode: KeyboardKey;
}

export interface InputMappingActionKeyboardInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingActionKeyboardDataInterface;
}

export interface InputMappingActionMouseDataInterface extends InputMappingDataInterface {
  button: InputMouseButtonEnum;
}

export interface InputMappingActionMouseInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingActionMouseDataInterface;
}

export interface InputMappingActionGamepadDataInterface extends InputMappingDataInterface {
  button: InputGamepadButtonEnum;
}

export interface InputMappingActionGamepadInterface extends InputMappingInterface {
  device: InputDeviceEnum;
  data: InputMappingActionGamepadDataInterface;
}

export interface InputEnumStickValues {
  x: number;
  y: number;
}

/********** Enums **********/
export enum InputAxisEnum {
  X,
  Y,
}

export enum InputModeEnum {
  KeyboardAndMouse,
  Gamepad,
  VR,
}

export enum InputDeviceEnum {
  Keyboard,
  Mouse,
  Gamepad,
  Touch,
  DeviceOrientation,
}

export enum InputMouseAxisEnum {
  X,
  Y,
  Wheel,
}

export enum InputMouseButtonEnum {
  Left,
  Middle,
  Right,
}

export enum InputGamepadAxisEnum {
  LeftStickX,
  LeftStickY,
  RightStickX,
  RightStickY,
  LeftTrigger,
  RightTrigger,
}

export enum InputGamepadAxisPropertyEnum {
  LeftStickX = 'leftStickX',
  LeftStickY = 'leftStickY',
  RightStickX = 'rightStickX',
  RightStickY = 'rightStickY',
  LeftTrigger = 'leftTrigger',
  RightTrigger  = 'rightTrigger',
}

export enum InputGamepadButtonEnum {
  A,
  B,
  X,
  Y,
  Start,
  Back,
  LeftStick,
  RightStick,
  LB,
  RB,
  LT,
  RT,
  DPadUp,
  DPadDown,
  DPadLeft,
  DPadRight,
}

export enum InputGamepadButtonPropertyEnum {
  A = 'buttonA',
  B = 'buttonB',
  X = 'buttonX',
  Y = 'buttonY',
  Start = 'buttonStart',
  Back = 'buttonBack',
  LeftStick = 'buttonLeftStick',
  RightStick = 'buttonRightStick',
  LB = 'buttonLB',
  RB = 'buttonRB',
  LT = 'leftTrigger',
  RT = 'rightTrigger',
  DPadUp = 'buttonDPadUp',
  DPadDown = 'buttonDPadDown',
  DPadLeft = 'buttonDPadLeft',
  DPadRight = 'buttonDPadRight',
}

export enum InputEnum {
  /***** Keyboard *****/
  Keyboard0,
  Keyboard1,
  Keyboard2,
  Keyboard3,
  Keyboard4,
  Keyboard5,
  Keyboard6,
  Keyboard7,
  Keyboard8,
  Keyboard9,
  KeyboardNum0,
  KeyboardNum1,
  KeyboardNum2,
  KeyboardNum3,
  KeyboardNum4,
  KeyboardNum5,
  KeyboardNum6,
  KeyboardNum7,
  KeyboardNum8,
  KeyboardNum9,
  KeyboardA,
  KeyboardB,
  KeyboardC,
  KeyboardD,
  KeyboardE,
  KeyboardF,
  KeyboardG,
  KeyboardH,
  KeyboardI,
  KeyboardJ,
  KeyboardK,
  KeyboardL,
  KeyboardM,
  KeyboardN,
  KeyboardO,
  KeyboardP,
  KeyboardR,
  KeyboardS,
  KeyboardT,
  KeyboardU,
  KeyboardV,
  KeyboardW,
  KeyboardY,
  KeyboardZ,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardSpace,
  KeyboardEnter,
  KeyboardEscape,
  // TODO
  /***** Mouse *****/
  MouseX,
  MouseY,
  MouseButtonLeft,
  MouseButtonMiddle,
  MouseButtonRight,
  MouseWheel,
  // TODO
  /***** Gamepad *****/
  GamepadButtonA,
  GamepadButtonB,
  GamepadButtonX,
  GamepadButtonY,
  GamepadButtonStart,
  GamepadButtonBack,
  GamepadButtonLeftStick,
  GamepadButtonRightStick,
  GamepadButtonLB,
  GamepadButtonRB,
  GamepadButtonLT,
  GamepadButtonRT,
  GamepadDPadUp,
  GamepadDPadDown,
  GamepadDPadLeft,
  GamepadDPadRight,
  GamepadLeftStickX,
  GamepadLeftStickY,
  GamepadRightStickX,
  GamepadRightStickY,
  GamepadLeftTrigger,
  GamepadRightTrigger,
  // TODO
}
