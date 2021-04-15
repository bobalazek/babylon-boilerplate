import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
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

  load(): Promise<WorldInterface> {
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

    this.setActiveCamera(camera);
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
    let skybox = Mesh.CreateBox('skybox', 1024, this.scene);
    var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.useSunPosition = true;
    skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
    skybox.material = skyboxMaterial;

    // Ground
    let ground = MeshBuilder.CreateGround('ground', {
      width: 128,
      height: 128,
    });
    let groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
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
