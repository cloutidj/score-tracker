import { InjectionToken } from '@angular/core';
import { PlayerColor } from '@models/player-color';

export const DEFAULT_PLAYER_COUNT = new InjectionToken<number>('DEFAULT_PLAYER_COUNT');
export const PLAYER_COLOR_LIST = new InjectionToken<PlayerColor[]>('PLAYER_COLOR_LIST');
