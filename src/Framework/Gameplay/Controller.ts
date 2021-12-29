import {
  TransformNode,
  Vector2,
  Vector3,
  ArcRotateCamera,
} from 'babylonjs';

import {
  GameManager,
} from '../Core/GameManager';

export interface ControllerInterface {
  start(): void;
  update(): void;
  enable(): void;
  disable(): void;
  posessTransformNode(transformNode: TransformNode): void;
}

export class AbstractController implements ControllerInterface {
  public start() {}
  public update() {}
  public enable() {}
  public disable() {}
  public posessTransformNode(transformNode: TransformNode) {}
}

export class ThirdPersonController extends AbstractController {
  public cameraUseInertia: boolean = false;
  public cameraAlphaMultiplier: number = 0.0003;
  public cameraBetaMultiplier: number = 0.0002;
  public cameraRadiusMultiplier: number = 0.002;

  private _isEnabled: boolean = false;
  private _posessedTransformNode: TransformNode;

  private readonly _forward = new Vector3(0, 0, 1);
  private readonly _forwardInverted = new Vector3(0, 0, -1);
  private readonly _right = new Vector3(1, 0, 0);
  private readonly _rightInverted = new Vector3(-1, 0, 0);

  public start() {
    const onPointerLockChange = () => {
      if (GameManager.engine.isPointerLock) {
        this.enable();
      } else {
        this.disable();
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mspointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);
  }

  public update() {
    if (!this._isEnabled) {
      return;
    }

    /***** Input *****/
    const inputAxes = GameManager.inputManager.axes;

    // Location
    let inputLocation = Vector2.Zero();

    if (inputAxes['moveForward'] !== 0) {
      inputLocation.addInPlace(
        new Vector2(0, inputAxes['moveForward'])
      );
    }

    if (inputAxes['moveRight'] !== 0) {
      inputLocation.addInPlace(
        new Vector2(inputAxes['moveRight'], 0)
      );
    }

    // Rotation
    let inputRotation = Vector2.Zero();

    if (inputAxes['lookRight'] !== 0) {
      inputRotation.addInPlace(
        new Vector2(inputAxes['lookRight'], 0)
      );
    }

    if (inputAxes['lookUp'] !== 0) {
      inputRotation.addInPlace(
        new Vector2(0, inputAxes['lookUp'])
      );
    }

    /***** Mesh & camera update *****/
    if (this._posessedTransformNode) {
      const camera = <ArcRotateCamera>GameManager.scene.activeCamera;

      if (inputAxes['lookZoom']) {
        if (this.cameraUseInertia) {
          camera.inertialRadiusOffset += inputAxes['lookZoom'] * -this.cameraRadiusMultiplier;
        } else {
          camera.radius += inputAxes['lookZoom'] * this.cameraRadiusMultiplier;
        }
      }

      if (
        inputRotation.x !== 0 ||
        inputRotation.y !== 0
      ) {
        if (this.cameraUseInertia) {
          camera.inertialAlphaOffset += inputRotation.x * this.cameraAlphaMultiplier * -1;
          camera.inertialBetaOffset += inputRotation.y * this.cameraBetaMultiplier * -1;
        } else {
          camera.alpha += inputRotation.x * this.cameraAlphaMultiplier * -1;
          camera.beta += inputRotation.y * this.cameraBetaMultiplier * -1;
        }
      }

      if (
        inputLocation.x !== 0 ||
        inputLocation.y !== 0
      ) {
        const rightVector = GameManager.scene.useRightHandedSystem
          ? this._rightInverted
          : this._right;
        const forwardVector = GameManager.scene.useRightHandedSystem
          ? this._forwardInverted
          : this._forward;
        const cameraRight = Vector3.TransformNormal(
          rightVector,
          camera.getWorldMatrix()
        ).normalize().scaleInPlace(inputLocation.x);
        const cameraForward = Vector3.TransformNormal(
          forwardVector,
          camera.getWorldMatrix()
        ).normalize().scaleInPlace(inputLocation.y);
        const direction = new Vector3(
          cameraRight.x + cameraForward.x,
          0,
          cameraRight.z + cameraForward.z
        ).normalize();

        this._posessedTransformNode.position.addInPlaceFromFloats(
          direction.x,
          0,
          direction.z
        );

        this._posessedTransformNode.rotation = new Vector3(
          0,
          (Math.atan2(direction.z, direction.x) * -1) + Math.PI / 2,
          0
        );
      }
    }
  }

  public enable() {
    this._isEnabled = true;
  }

  public disable() {
    this._isEnabled = false;
  }

  public posessTransformNode(transformNode: TransformNode) {
    this._posessedTransformNode = transformNode;

    const camera = <ArcRotateCamera>GameManager.scene.activeCamera;
    camera.lockedTarget = this._posessedTransformNode;
  }

  public get posessedTransformNode() {
    return this._posessedTransformNode;
  }
}
