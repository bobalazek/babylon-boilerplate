import {
  TransformNode,
} from 'babylonjs';

export class NetworkSerializer {
  public static serializeTransformNode(transformNode: TransformNode, precision: number = 5): string {
    return [
      parseFloat(transformNode.position.x.toFixed(precision)),
      parseFloat(transformNode.position.y.toFixed(precision)),
      parseFloat(transformNode.position.z.toFixed(precision)),
      parseFloat(transformNode.rotation.x.toFixed(precision)),
      parseFloat(transformNode.rotation.y.toFixed(precision)),
      parseFloat(transformNode.rotation.z.toFixed(precision)),
    ].join('|');
  }

  public static deserializeTransformNode(serializedTransformNode: string): any {
    const split = serializedTransformNode.split('|');
    return {
      position: {
        x: parseFloat(split[0]),
        y: parseFloat(split[1]),
        z: parseFloat(split[2]),
      },
      rotation: {
        x: parseFloat(split[3]),
        y: parseFloat(split[4]),
        z: parseFloat(split[5]),
      },
    };
  }
}
