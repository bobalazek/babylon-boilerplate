import {
  Key as KeyboardKey,
} from 'ts-keycode-enum';

import {
  InputDeviceEnum,
  InputAxisEnum,
  InputMouseAxisEnum,
  InputMouseButtonEnum,
  InputGamepadAxisEnum,
  InputGamepadButtonEnum,
  InputMappingInterface,
} from '../Input/InputConstants';

export interface InputBindingsInterface {
  axisMappings: { [key: string]: Array<InputMappingInterface> };
  actionMappings: { [key: string]: Array<InputMappingInterface> };
}

export class AbstractInputBindings implements InputBindingsInterface {
  public axisMappings = {};
  public actionMappings = {};
}

export class ThirdPersonInputBindings extends AbstractInputBindings {
  public axisMappings = {
    moveForward: [
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.UpArrow,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.W,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.DownArrow,
          scale: -1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.S,
          scale: -1.0,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          axis: InputGamepadAxisEnum.LeftStickY,
          scale: -1.0,
        },
      },
    ],
    moveRight: [
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.RightArrow,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.D,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.LeftArrow,
          scale: -1.0,
        },
      },
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode:  KeyboardKey.A,
          scale: -1.0,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          axis: InputGamepadAxisEnum.LeftStickX,
          scale: 1.0,
        },
      },
    ],
    lookUp: [
      {
        device: InputDeviceEnum.Mouse,
        data: {
          axis:  InputAxisEnum.Y,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          axis: InputGamepadAxisEnum.RightStickY,
          scale: 50.0,
        },
      },
    ],
    lookRight: [
      {
        device: InputDeviceEnum.Mouse,
        data: {
          axis:  InputMouseAxisEnum.X,
          scale: 1.0,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          axis: InputGamepadAxisEnum.RightStickX,
          scale: 20.0,
        },
      },
    ],
    lookZoom: [
      {
        device: InputDeviceEnum.Mouse,
        data: {
          axis:  InputMouseAxisEnum.Wheel,
          scale: 1.0,
        },
      },
    ],
  };
  public actionMappings = {
    interact: [
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode: KeyboardKey.F,
        },
      },
      {
        device: InputDeviceEnum.Mouse,
        data: {
          button: InputMouseButtonEnum.Left,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          button: InputGamepadButtonEnum.A,
        },
      },
    ],
    jump: [
      {
        device: InputDeviceEnum.Keyboard,
        data: {
          keyCode: KeyboardKey.Space,
        },
      },
      {
        device: InputDeviceEnum.Gamepad,
        data: {
          button: InputGamepadButtonEnum.B,
        },
      },
    ],
  };
}
