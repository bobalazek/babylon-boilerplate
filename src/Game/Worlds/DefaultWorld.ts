import { MeshBuilder } from 'babylonjs';

import { GameManager } from '../../Framework/Core/GameManager';
import { AbstractWorld } from '../../Framework/Worlds/World';

export class DefaultWorld extends AbstractWorld {
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
        this.scene.getMeshByID(playerCharacterId)
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
