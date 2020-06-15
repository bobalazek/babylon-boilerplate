import { MeshBuilder } from 'babylonjs';

import { GameManager } from '../../Framework/Core/GameManager';
import { AbstractScene } from '../../Framework/Scenes/Scene';

export class DefaultScene extends AbstractScene {
  load() {
    return new Promise((resolve) => {
      // Show preloader
      GameManager.engine.displayLoadingUI();

      const playerCharacterId = 'player';

      this.prepareCamera();
      this.prepareLights();
      this.prepareEnvironment();
      this.preparePlayer(playerCharacterId);
      this.controller.posessTransformNode(
        this.babylonScene.getMeshByID(playerCharacterId)
      );

      // Hide preloader
      GameManager.engine.hideLoadingUI();

      resolve(this);
    });
  }

  preparePlayer(playerCharacterId: string = 'player') {
    let playerCharacter = MeshBuilder.CreateCylinder(playerCharacterId, {
      height: 2,
    });
    playerCharacter.position.y = 1;
  }
}
