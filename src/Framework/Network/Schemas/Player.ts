import {
  Schema,
  type,
} from '@colyseus/schema';

export class Player extends Schema {
  @type("string")
  sessionId: string;

  @type("string")
  name: string;

  @type("boolean")
  connected: boolean = true;

  @type("uint64")
  disconnectedSince: number = 0;

  @type("boolean")
  ready: boolean = false;

  @type("int16")
  ping: number = -1;

  set(player: any) {
    this.sessionId = player.sessionId;
    this.name = player.name;
    this.connected = player.connected;
    this.ready = player.ready;
    this.ping = player.ping;
  }
}
