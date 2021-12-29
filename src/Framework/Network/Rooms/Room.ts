import {
  Room,
  Client,
} from 'colyseus';

import {
  NetworkSerializer,
} from '../NetworkSerializer';
import {
  NetworkRoomConstants,
} from '../NetworkConstants';
import {
  RoomState,
} from '../Schemas/RoomState';
import {
  Player,
} from '../Schemas/Player';

export abstract class AbstractRoom extends Room {
  DISCONNECTION_TIMEOUT_SECONDS: number = 10;

  onCreate(options: any) {
    console.log('Room created!', options);

    this.setState(new RoomState());

    this.onMessagePing = this.onMessagePing.bind(this);
    this.onMessageSetPlayerPing = this.onMessageSetPlayerPing.bind(this);
    this.onMessageSetPlayerReady = this.onMessageSetPlayerReady.bind(this);
    this.onMessageTransformMovementUpdate = this.onMessageTransformMovementUpdate.bind(this);
    this.onMessageNewChatMessage = this.onMessageNewChatMessage.bind(this);
    this.onMessageLeave = this.onMessageLeave.bind(this);

    this.onMessage(
      NetworkRoomConstants.PING,
      this.onMessagePing
    );
    this.onMessage(
      NetworkRoomConstants.SET_PLAYER_PING,
      this.onMessageSetPlayerPing
    );
    this.onMessage(
      NetworkRoomConstants.SET_PLAYER_READY,
      this.onMessageSetPlayerReady
    );
    this.onMessage(
      NetworkRoomConstants.TRANSFORM_MOVEMENT_UPDATE,
      this.onMessageTransformMovementUpdate
    );
    this.onMessage(
      NetworkRoomConstants.NEW_CHAT_MESSAGE,
      this.onMessageNewChatMessage
    );

    // Cleanup interval
    setInterval(() => {
      const now = Date.now();
      this.state.players.forEach((player: Player) => {
        if (player.disconnectedSince) {
          const difference = now - player.disconnectedSince;
          if (difference > this.DISCONNECTION_TIMEOUT_SECONDS * 1000) {
            this.state.removePlayer(player.sessionId);
          }
        }
      });
    }, 2000);
  }

  onJoin(client: Client, options: any, auth: any) {
    this.state.addPlayer(
      client.sessionId,
      'John Doe #' + client.sessionId
    );
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) {
      return;
    }

    player.connected = false;
    player.disconnectedSince = Date.now();

    try {
      if (consented) {
        throw new Error('Consented leave');
      }

      await this.allowReconnection(client, this.DISCONNECTION_TIMEOUT_SECONDS);

      player.connected = true;
      player.disconnectedSince = 0;
    } catch (e) {
      this.state.removePlayer(client.sessionId);
    }
  }

  onMessagePing(client: Client, message: any) {
    client.send(NetworkRoomConstants.PONG, message);
  }

  onMessageSetPlayerPing(client: Client, message: any) {
    this.state.players.get(client.sessionId).ping = parseInt(message);
  }

  onMessageSetPlayerReady(client: Client, message: any) {
    this.state.players.get(client.sessionId).ready = !!message;
  }

  onMessageTransformMovementUpdate(client: Client, message: any) {
    const id = message[0];
    const transformMatrix = NetworkSerializer.deserializeTransformNode(message[1]);

    if (typeof this.state.transforms.get(id) === 'undefined') {
      this.state.addTransform(id, transformMatrix);
    } else {
      this.state.setTransform(id, transformMatrix);
    }
  }

  onMessageNewChatMessage(client: Client, message: any) {
    const text = message;

    this.state.addChatMessage(text, client.sessionId);
  }

  onMessageLeave(client: Client, message: any) {
    this.disconnect();
  }

  onDispose() {
    console.log('Dispose Room.');
  }
}
