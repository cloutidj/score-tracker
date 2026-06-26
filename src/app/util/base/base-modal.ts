import { ModalComponentInterface } from '@util/modal/modal-component.interface';

export class BaseModal<T> implements ModalComponentInterface {
  protected readonly _result: Promise<T>;
  protected _resolve!: (value: T) => void;
  protected _reject!: (reason?: unknown) => void;

  constructor() {
    this._result = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get result(): Promise<T> {
    return this._result;
  }
}
