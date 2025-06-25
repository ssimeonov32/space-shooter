import { KeyboardKey, MouseButton } from "../constants";

export default class Controller {
  private keys: Record<string, boolean> = {
    [KeyboardKey.A]: false,
    [KeyboardKey.W]: false,
    [KeyboardKey.S]: false,
    [KeyboardKey.D]: false,
    [MouseButton.LEFT]: false,
    [MouseButton.RIGHT]: false,
  }

  constructor() {
    window.addEventListener("keydown", this.keysDown.bind(this));
    window.addEventListener("keyup", this.keysUp.bind(this));
  }

  private keysDown(event: KeyboardEvent) {
    this.keys[event.code] = true;
  }

  private keysUp(event: KeyboardEvent) {
    this.keys[event.code] = false;
  }

  public isKeyDown(key: string): boolean {
    return this.keys[key] || false;
  }

  public getKeys(): Record<string, boolean> {
    return { ...this.keys };
  }

  public setKey(key: string, value: boolean): void {
    if (this.keys[key] === undefined) return;
    this.keys[key] = value;
  }
}