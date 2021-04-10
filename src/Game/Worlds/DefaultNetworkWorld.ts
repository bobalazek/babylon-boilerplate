import {
  Vector3,
  MeshBuilder,
} from 'babylonjs';
import store from 'store';

import { GameManager } from '../../Framework/Core/GameManager';
import { AbstractNetworkWorld } from '../../Framework/Worlds/NetworkWorld';
import { RoomState } from '../../Framework/Network/Schemas/RoomState';
import { Transform } from '../../Framework/Network/Schemas/Transform';
import {
  GAME_SERVER_HOST,
  GAME_SERVER_PORT,
} from '../Config';

export class DefaultNetworkWorld extends AbstractNetworkWorld {
  public networkHost: string = GAME_SERVER_HOST;
  public networkPort: number = GAME_SERVER_PORT;

  load() {
    return new Promise((resolve) => {
      // Show preloader
      GameManager.engine.displayLoadingUI();

      this.prepareCamera();
      this.prepareLights();
      this.prepareEnvironment();
      this.prepareNetwork();

      // Hide preloader
      GameManager.engine.hideLoadingUI();
      
      // Force pointer lock
      GameManager.inputManager.setForcePointerLock(true);

      resolve(this);
    });
  }

  prepareNetwork() {
    const lastNetworkRoomId = store.get('lastNetworkRoomId');
    const lastNetworkRoomSessionId = store.get('lastNetworkRoomSessionId');
    if (
      lastNetworkRoomId &&
      lastNetworkRoomSessionId
    ) {
      this.prepareNetworkReconnect(lastNetworkRoomId, lastNetworkRoomSessionId)
        .then(() => {
          this.prepareNetworkPing();
          this.prepareNetworkToReplicateTransformsMovement();
        })
        .catch((throws) => {
          // Fallback if the room doesn't exist
          this.prepareNetworkClientAndJoinLobbyRoom();
        });
    } else {
      this.prepareNetworkClientAndJoinLobbyRoom();
    }
  }

  prepareNetworkClientAndJoinLobbyRoom() {
    this.prepareNetworkClientAndJoinRoom('lobby').then(() => {
      this.prepareNetworkPing();
      this.prepareNetworkToReplicateTransformsMovement();
    });
  }

  prepareNetworkToReplicateTransformsMovement() {
    super.prepareNetworkToReplicateTransformsMovement();

    const networkRoomState = <RoomState>this.networkRoom.state;

    // Transforms
    this.networkRoom.onStateChange.once((state: RoomState) => {
      for (let i = 0; i < state.transforms.length; i++) {
        this.prepareNetworkTransform(state.transforms[i]);
      }
    });

    networkRoomState.transforms.onAdd = (transform: Transform, key: string) => {
      this.prepareNetworkTransform(transform);
    };

    networkRoomState.transforms.onChange = (transform: Transform, key: string) => {
      if (transform.sessionId === this.networkRoomSessionId) {
        return;
      }

      let transformNode = this.scene.getMeshByID(transform.id);
      if (!transformNode) {
        return;
      }

      if (
        !transformNode.metadata ||
        !transformNode.metadata.network
      ) {
        this.prepareTransformNodeNetworkMetadata(transformNode);
      }

      const serverData = {
        position: new Vector3(
          transform.position.x,
          transform.position.y,
          transform.position.z
        ),
        rotation: new Vector3(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z
        ),
      };

      transformNode.metadata.network.serverData = serverData;
      transformNode.metadata.network.serverLastUpdate = (new Date()).getTime();
    };

    networkRoomState.transforms.onRemove = (transform: Transform, key: string) => {
      let transformNode = this.scene.getMeshByID(transform.id);
      if (!transformNode) {
        return;
      }

      transformNode.dispose();
    };
  }

  prepareNetworkTransform(transform: Transform) {
    if (transform.type === 'player') {
      let transformMesh = MeshBuilder.CreateCylinder(transform.id, {
        height: 2,
      });

      transformMesh.position = new Vector3(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );
      transformMesh.rotation = new Vector3(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z
      );

      if (transform.sessionId === this.networkRoomSessionId) {
        this.controller.posessTransformNode(transformMesh);
        this.prepareNetworkReplicateMovementForLocalTransform(transformMesh);
      }
    }
  }
}
