import { PlayerBase } from './player-base';

export class Player extends PlayerBase {
  constructor(public playerNumber: number) {
    super();
  }
}
