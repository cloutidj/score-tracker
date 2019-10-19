import { ModalComponentInterface } from '@util/modal/modal-component.interface';

export class BaseModal<T> implements ModalComponentInterface {
  protected readonly _result: Promise<T>;
  protected _resolve: any;
  protected _reject: any;

  constructor() {
    this._result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public get result(): Promise<T> {
    return this._result;
  }
}
