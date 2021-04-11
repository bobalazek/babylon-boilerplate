import {
  GameManager,
} from '../Framework/Core/GameManager';

import {
  ThirdPersonController,
} from '../Framework/Gameplay/Controller';
import {
  ThirdPersonInputBindings,
} from '../Framework/Gameplay/InputBindings';
import {
  DefaultNetworkWorld,
} from './Worlds/DefaultNetworkWorld';

const canvasElement = <HTMLCanvasElement>document.getElementById('canvas');

GameManager.boot({
  defaultWorld: DefaultNetworkWorld,
  canvasElement,
  controller: ThirdPersonController,
  inputBindings: ThirdPersonInputBindings,
  engineOptions: {
    stencil: true,
  },
});
