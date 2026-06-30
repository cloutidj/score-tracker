import { Player } from './player';
import { PlayerColor } from './player-color';

/**
 * JSON-safe flattening of a {@link Player}; rebuilt into a `Player` instance via
 * {@link playerFromSnapshot}. The color is already plain data ({@link PlayerColor}), so it
 * travels through persistence as-is.
 */
export interface PlayerSnapshot {
  name: string;
  playerNumber: number;
  color: PlayerColor;
}

/** Flatten a live `Player` to its JSON-safe snapshot. */
export function toPlayerSnapshot(player: Player): PlayerSnapshot {
  return {
    name: player.name,
    playerNumber: player.playerNumber,
    color: { ...player.color },
  };
}

/** Rebuild a `Player` instance from its snapshot. */
export function playerFromSnapshot(snap: PlayerSnapshot): Player {
  return Object.assign(new Player(snap.playerNumber), {
    name: snap.name,
    color: { ...snap.color },
  });
}
