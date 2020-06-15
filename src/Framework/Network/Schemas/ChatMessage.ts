import {
  Schema,
  type,
} from '@colyseus/schema';

export class ChatMessage extends Schema {
  @type("string")
  sessionId: string;

  @type("string")
  text: string;
}
