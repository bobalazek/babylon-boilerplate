import { GameManager } from '../Framework/Core/GameManager';

import { ThirdPersonController } from '../Framework/Gameplay/Controller';
import { ThirdPersonInputBindings } from '../Framework/Gameplay/InputBindings';
import { DefaultNetworkScene } from './Scenes/DefaultNetworkScene';

GameManager.boot({
  defaultScene: DefaultNetworkScene,
  controller: ThirdPersonController,
  inputBindings: ThirdPersonInputBindings,
  isServer: false,
  canvasElementId: 'game',
  engineOptions: {
    stencil: true,
  },
});
