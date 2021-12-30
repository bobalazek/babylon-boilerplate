import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Tools,
  Color3,
} from 'babylonjs';
import {
  SkyMaterial,
} from 'babylonjs-materials';
import store from 'store';

import { GameManager } from '../../Framework/Core/GameManager';
import { WorldInterface } from '../../Framework/Worlds/World';
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
  public groundSize: number = 128;

  start() {
    super.start();

    this.scene.getEngine().displayLoadingUI();
  }

  load(): Promise<WorldInterface> {
    return new Promise((resolve) => {
      this.prepareCamera();
      this.prepareLights();
      this.prepareEnvironment();
      this.prepareNetwork();

      // Hide preloader
      this.scene.getEngine().hideLoadingUI();

      // Force pointer lock
      GameManager.inputManager.setForcePointerLock(true);

      resolve(this);
    });
  }

  /***** Helpers *****/
  prepareCamera() {
    let camera = new ArcRotateCamera(
      'camera',
      Tools.ToRadians(0),
      Tools.ToRadians(60),
      10,
      Vector3.Zero(),
      this.scene
    );

    camera.lowerBetaLimit = Tools.ToRadians(10);
    camera.upperBetaLimit = Tools.ToRadians(80);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 20;

    this.scene.activeCamera = camera;
  }

  prepareLights() {
    new HemisphericLight(
      'light',
      Vector3.Up(),
      this.scene
    );
  }

  prepareEnvironment() {
    // Skybox
    let skybox = MeshBuilder.CreateBox('skybox', {
      size: this.groundSize,
    }, this.scene);
    var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.useSunPosition = true;
    skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
    skybox.material = skyboxMaterial;

    // Ground
    let ground = MeshBuilder.CreateGround('ground', {
      width: this.groundSize,
      height: this.groundSize,
    }, this.scene);
    let groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    ground.material = groundMaterial;
  }

  prepareInspector() {
    this.scene.debugLayer.show();
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
      state.transforms.forEach((transform: Transform) => {
        this.prepareNetworkTransform(transform);
      });
    });

    networkRoomState.transforms.onAdd = (transform: Transform) => {
      this.prepareNetworkTransform(transform);
    };

    networkRoomState.transforms.onRemove = (transform: Transform) => {
      this.scene.getMeshById(transform.id)?.dispose();
    };
  }

  prepareNetworkTransform(transform: Transform) {
    if (transform.type === 'player') {
      const existingTransform = this.scene.getNodeById(transform.id);
      if (existingTransform) {
        return;
      }

      let transformMesh = MeshBuilder.CreateCylinder(transform.id, {
        height: 2,
      }, this.scene);

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
      } else {
        // Sync metadata
        if (
          !transformMesh.metadata ||
          !transformMesh.metadata.network
        ) {
          this.prepareTransformNodeNetworkMetadata(transformMesh);
        }

        transformMesh.metadata.network.serverData = {
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

        transform.rotation.onChange = (changes) => {
          let newValue = transformMesh.rotation.clone();
          changes.forEach((change) => {
            newValue[change.field] = change.value;
          });
          transformMesh.metadata.network.serverData.rotation = newValue;
          transformMesh.metadata.network.serverLastUpdate = (new Date()).getTime();
        };

        transform.position.onChange = (changes) => {
          let newValue = transformMesh.position.clone();
          changes.forEach((change) => {
            newValue[change.field] = change.value;
          });
          transformMesh.metadata.network.serverData.position = newValue;
          transformMesh.metadata.network.serverLastUpdate = (new Date()).getTime();
        };
      }
    }
  }
}
