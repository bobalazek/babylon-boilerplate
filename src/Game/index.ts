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

GameManager.boot({
  defaultWorld: DefaultNetworkWorld,
  controller: ThirdPersonController,
  inputBindings: ThirdPersonInputBindings,
  canvasElementId: 'game',
  engineOptions: {
    stencil: true,
  },
});
