import {
  Schema,
  ArraySchema,
  MapSchema,
  type,
} from '@colyseus/schema';

import {
  Transform,
} from './Transform';
import {
  Player,
} from './Player';
import {
  ChatMessage,
} from './ChatMessage';

export enum RoomStateStatus {
  PENDING,
  STARTED,
  ENDED,
};

export class RoomState extends Schema {
  @type("uint8")
  status: number = RoomStateStatus.PENDING;

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: Transform })
  transforms = new MapSchema<Transform>();

  @type([ ChatMessage ])
  chatMessages = new ArraySchema<ChatMessage>();

  /***** Player *****/
  addPlayer(id: string, name: string) {
    let player = new Player();

    player.set({
      sessionId: id,
      name: name,
      ready: false,
      ping: 0,
      posessedTransformNodeId: null,
    });

    this.players[id] = player;

    const spawnTransformMatrix = {
      position: {
        x: Math.floor(Math.random() * 10),
        y: 0,
        z: Math.floor(Math.random() * 10),
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    };

    const transformId = 'player_' + id;
    this.addTransform(
      transformId,
      id,
      spawnTransformMatrix,
      'player',
      '{}'
    );
  }

  removePlayer(sessionId: string) {
    const player = this.players.get(sessionId);
    if (player) {
      this.transforms.forEach((transform, transformId) => {
        if (transform.sessionId === sessionId) {
          this.transforms.delete(transformId);
        }
      });

      this.players.delete(sessionId);
    }
  }

  /***** Transform *****/
  addTransform(
    id: string,
    sessionId: string,
    transformMatrix: any,
    type: string,
    parameters: string
  ) {
    let transform = new Transform();

    transform.id = id;
    transform.sessionId = sessionId;
    transform.position.set(transformMatrix.position);
    transform.rotation.set(transformMatrix.rotation);
    transform.type = type;
    transform.parameters = parameters;

    this.transforms[id] = transform;
  }

  setTransform(id: string, transformMatrix: any) {
    const transform = this.transforms.get(id);
    transform.position.set(transformMatrix.position);
    transform.rotation.set(transformMatrix.rotation);
  }

  removeTransform(id: string) {
    this.transforms.delete(id);
  }

  /***** Chat message *****/
  addChatMessage(
    text: string,
    sessionId: string
  ) {
    let chatMessage = new ChatMessage();

    chatMessage.text = text;
    chatMessage.sessionId = sessionId;

    this.chatMessages.push(chatMessage);
  }
}
