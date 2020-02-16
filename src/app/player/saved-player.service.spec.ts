import { PlayerPreference } from '@models/player-preference';
import { SavedPlayerService } from './saved-player.service';
import { DatabaseService } from '@util/database.service';
import { PlayerBase } from '@models/player-base';

describe('PerRoundScoringComponent', () => {
  let service: SavedPlayerService;
  let mockDatabase: jasmine.SpyObj<DatabaseService>;
  const DB_KEY = 'SavedPlayers';

  describe('EmptyInit', () => {
    beforeEach(() => {
      mockDatabase = jasmine.createSpyObj('DatabaseService', ['get', 'save']);
      mockDatabase.get.and.returnValue(null);
      service = new SavedPlayerService(mockDatabase);
    });

    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should initalized the data if missing', () => {
      expect(mockDatabase.save).toHaveBeenCalledWith(DB_KEY, []);
    });
  });

  describe('ExistingData', () => {
    const init = [
      new PlayerPreference(),
      new PlayerPreference()
    ];

    init[0].playerPreferenceId = 1;
    init[1].playerPreferenceId = 2;

    beforeEach(() => {
      mockDatabase = jasmine.createSpyObj('DatabaseService', ['get', 'save', 'add', 'update', 'remove']);
      mockDatabase.get.and.returnValue(init);
      service = new SavedPlayerService(mockDatabase);
    });

    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should not be initalized the data exists', () => {
      expect(mockDatabase.save).not.toHaveBeenCalled();
    });

    it('should emit the initial data', (done: DoneFn) => {
      service.getSavedPlayers().subscribe(data => {
        expect(data).toEqual(init);
        done();
      });
    });

    it('should add to the datastore and refresh', () => {
      mockDatabase.get.calls.reset();
      const newPlayer = new PlayerBase();
      service.addPlayer(newPlayer);

      service.getSavedPlayers().subscribe(() => {
        expect(mockDatabase.get).toHaveBeenCalled();
      });

      const newPlayerData = mockDatabase.add.calls.mostRecent().args[1] as PlayerPreference;
      expect(newPlayerData.playerPreferenceId).toBeCloseTo(Date.now(), -4);
      expect(mockDatabase.add).toHaveBeenCalledWith(DB_KEY, jasmine.any(PlayerBase));
    });

    it('should find existing to edit existing and refresh', () => {
      init[0].name = 'New';
      service.editPlayer(init[0]);

      service.getSavedPlayers().subscribe(() => {
        expect(mockDatabase.get).toHaveBeenCalled();
      });

      const args = mockDatabase.update.calls.mostRecent().args;
      const editPlayerData = args[1] as PlayerPreference;
      const findFunction = args[2] as (player: PlayerPreference) => boolean;
      expect(editPlayerData.playerPreferenceId).toEqual(init[0].playerPreferenceId);
      expect(findFunction(init[0])).toEqual(true);
      expect(findFunction(init[1])).toEqual(false);
      expect(mockDatabase.update).toHaveBeenCalledWith(DB_KEY, jasmine.any(PlayerPreference), jasmine.any(Function));
    });

    it('should find existing to remove existing and refresh', () => {
      service.removePlayer(init[0].playerPreferenceId);

      service.getSavedPlayers().subscribe(() => {
        expect(mockDatabase.get).toHaveBeenCalled();
      });

      const args = mockDatabase.remove.calls.mostRecent().args;
      const findFunction = args[1] as (player: PlayerPreference) => boolean;
      expect(findFunction(init[0])).toEqual(true);
      expect(findFunction(init[1])).toEqual(false);
      expect(mockDatabase.remove).toHaveBeenCalledWith(DB_KEY, jasmine.any(Function));
    });
  });
});
