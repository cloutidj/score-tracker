import { PlayerBase } from './player-base';
import { PlayerColor } from '@models/player-color';

export class Player extends PlayerBase {
  playerNumber: number;
  name: string;
  color: PlayerColor;

  constructor(num: number) {
    super();
    this.playerNumber = num;
  }
}
