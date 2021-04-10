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

export abstract class AbstractRoom extends Room {
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
  }

  onJoin(client: Client, options: any, auth: any) {
    this.state.addPlayer(client.sessionId, 'John Doe');
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.players[client.sessionId].connected = false;

    try {
      if (consented) {
          throw new Error('Consented leave');
      }

      await this.allowReconnection(client, 10);

      this.state.players[client.sessionId].connected = true;
    } catch (e) {
      this.state.removePlayer(client.sessionId);
    }
  }

  onMessagePing(client: Client, message: any) {
    client.send(NetworkRoomConstants.PONG, message);
  }

  onMessageSetPlayerPing(client: Client, message: any) {
    this.state.players[client.sessionId].ping = parseInt(message);
  }

  onMessageSetPlayerReady(client: Client, message: any) {
    this.state.players[client.sessionId].ready = !!message;
  }

  onMessageTransformMovementUpdate(client: Client, message: any) {
    const id = message[0];
    const transformMatrix = NetworkSerializer.deserializeTransformNode(message[1]);

    if (typeof this.state.transforms[id] === 'undefined') {
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
