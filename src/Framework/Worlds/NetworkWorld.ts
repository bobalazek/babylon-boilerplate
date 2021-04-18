import {
  TransformNode,
  Vector3,
  Quaternion,
} from 'babylonjs';
import {
  Client,
  Room,
} from 'colyseus.js';
import store from 'store';

import {
  AbstractWorld,
} from './World';
import {
  NetworkSerializer,
} from '../Network/NetworkSerializer';
import {
  NetworkRoomConstants,
} from '../Network/NetworkConstants';

export abstract class AbstractNetworkWorld extends AbstractWorld {
  public networkHost: string;
  public networkPort: number;
  public networkClient: Client;
  public networkRoom: Room;
  public networkRoomSessionId: string;

  public readonly networkPingInterval: number = 1000; // in milliseconds
  public readonly networkInterpolationSmooting: number = 0.2; // value between 0.1 to 1
  public readonly networkInterpolationLastUpdateTolerance: number = 1000; // in milliseconds; only interpolate if the last update is older less than this

  prepareNetworkClient() {
    if (!this.networkHost && !this.networkPort) {
      throw new Error(
        'A networked room requires you to have `networkHost` and `networkPort` set in your world class.'
      );
    }

    if (!this.networkClient) {
      this.networkClient = new Client(
        'ws://' + this.networkHost + ':' + this.networkPort
      );
    }
  }

  prepareNetworkClientAndJoinRoom(roomName: string, roomOptions = {}): Promise<any> {
    this.prepareNetworkClient();

    return new Promise((resolve, reject) => {
      this.networkClient.joinOrCreate(roomName, roomOptions).then((room: Room) => {
        this.networkRoom = room;
        this.networkRoomSessionId = room.sessionId;

        store.set('lastNetworkRoomId', room.id);
        store.set('lastNetworkRoomSessionId', room.sessionId);

        resolve(room);
      }).catch(e => {
        reject(e);
      });
    });
  }

  prepareNetworkReconnect(roomId: string, sessionId: string) {
    this.prepareNetworkClient();

    return new Promise((resolve, reject) => {
      this.networkClient.reconnect(roomId, sessionId).then((room: Room) => {
        this.networkRoom = room;
        this.networkRoomSessionId = room.sessionId;

        resolve(room);
      }).catch(e => {
        reject(e);
      });
    });
  }

  prepareNetworkToReplicateTransformsMovement() {
    this.scene.onBeforeRenderObservable.add(() => {
      const now = (new Date()).getTime();
      const meshes = this.scene.meshes;

      for (let i = 0; i < meshes.length; i++) {
        let mesh = meshes[i];
        const meshMetadataNetwork = mesh.metadata && mesh.metadata.network
          ? mesh.metadata.network
          : false;

        if (
          meshMetadataNetwork !== false &&
          meshMetadataNetwork.serverReplicate === true &&
          meshMetadataNetwork.serverLastUpdate !== null &&
          // TODO: make that different? only update as long the final position/rotation isn't less than a certain tollerance?
          now - meshMetadataNetwork.serverLastUpdate < this.networkInterpolationLastUpdateTolerance
        ) {
          const serverData = mesh.metadata.network.serverData;

          // Position
          mesh.position = Vector3.Lerp(
            mesh.position,
            serverData.position,
            this.networkInterpolationSmooting
          );

          // Rotation
          const rotationQuaternion = Quaternion.RotationYawPitchRoll(
            serverData.rotation.y,
            serverData.rotation.x,
            serverData.rotation.z
          );

          if (!mesh.rotationQuaternion) {
            mesh.rotationQuaternion = Quaternion.Identity();
          }

          mesh.rotationQuaternion = Quaternion.Slerp(
            mesh.rotationQuaternion,
            rotationQuaternion,
            this.networkInterpolationSmooting
          );

          mesh.metadata.network.clientLastUpdate = now;
        }
      }
    });
  }

  prepareNetworkReplicateMovementForLocalTransform(transformNode: TransformNode, updateFrequency: number = 100) {
    this.prepareTransformNodeNetworkMetadata(transformNode);

    let lastUpdate = 0;
    let lastUpdateTimeAgo = 0;
    let lastTransformNodeMatrix = null;

    this.scene.onAfterRenderObservable.add(() => {
      const now = (new Date()).getTime();
      lastUpdateTimeAgo += now - lastUpdate;

      if (lastUpdateTimeAgo > updateFrequency) {
        const transformMatrix = NetworkSerializer.serializeTransformNode(transformNode);
        if (
          this.networkRoom &&
          lastTransformNodeMatrix !== transformMatrix
        ) {
          this.networkRoom.send(
            NetworkRoomConstants.TRANSFORM_MOVEMENT_UPDATE,
            [transformNode.id, transformMatrix]
          );

          lastTransformNodeMatrix = transformMatrix;
          lastUpdateTimeAgo = 0;
        }
      }

      lastUpdate = now;
    });
  }

  prepareNetworkPing() {
    let lastUpdate = 0;
    let lastUpdateTimeAgo = 0;

    this.scene.onAfterRenderObservable.add(() => {
      const now = (new Date()).getTime();
      lastUpdateTimeAgo += now - lastUpdate;

      if (lastUpdateTimeAgo > this.networkPingInterval) {
        this.networkRoom.send(
          NetworkRoomConstants.PING,
          now
        );

        lastUpdateTimeAgo = 0;
      }

      lastUpdate = now;
    });

    this.networkRoom.onMessage(NetworkRoomConstants.PONG, (message) => {
      const now = (new Date()).getTime();
      this.networkRoom.send(
        NetworkRoomConstants.SET_PLAYER_PING,
        now - message
      );
    });
  }

  setNetworkPlayerReady(state: boolean = true) {
    this.networkRoom.send(
      NetworkRoomConstants.SET_PLAYER_READY,
      state
    );
  }

  doNetworkLeave() {
    this.networkRoom.send(
      NetworkRoomConstants.LEAVE,
      true
    );

    store.remove('lastNetworkRoomId');
    store.remove('lastNetworkRoomSessionId');
  }

  prepareTransformNodeNetworkMetadata(transformNode: TransformNode) {
    if (!transformNode.metadata) {
      transformNode.metadata = {}
    }

    if (!transformNode.metadata.network) {
      transformNode.metadata.network = {
        serverReplicate: true,
        serverData: null,
        serverLastUpdate: null,
        clientLastUpdate: null,
      };
    }
  }
}
