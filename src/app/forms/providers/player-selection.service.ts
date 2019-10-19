import { Injectable } from '@angular/core';
import { Player } from '@models/player';

@Injectable()
export class PlayerSelectionService {
  public playerInfo: Player[];

  public initializePlayerList(): void {
    this.playerInfo = [ new Player(1), new Player(2) ];
  }

  public addPlayer(): void {
    this.playerInfo.push(new Player(this.playerInfo.length + 1));
  }

  public removePlayer(): void {
    const cnt = this.playerInfo.length;
    this.playerInfo = this.playerInfo.slice(0, cnt - 1);
  }

  public updatePlayer(newData: Player): void {
    const existing = this.playerInfo.find(p => p.playerNumber === newData.playerNumber);
    Object.assign(existing, newData);
  }
}
