import {
  Schema,
  type,
} from '@colyseus/schema';

export class Vector3 extends Schema {
  @type("float32")
  x: number = 0;

  @type("float32")
  y: number = 0;

  @type("float32")
  z: number = 0;

  constructor(vector3?: any) {
    super();

    if (vector3) {
      this.x = vector3.x;
      this.y = vector3.y;
      this.z = vector3.z;
    }
  }

  set(vector3: any) {
    this.x = vector3.x;
    this.y = vector3.y;
    this.z = vector3.z;
  }
}
