import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RecentGamesService, RecentGame } from './recent-games.service';
import { ApiService } from 'app/api/api-service';
import { StorageService } from 'app/services/storage.service';
import { of } from 'rxjs';

describe('RecentGamesService', () => {
  let service: RecentGamesService;
  let storageService: jasmine.SpyObj<StorageService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['getObject', 'setObject']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['gamesStillActive']);

    TestBed.configureTestingModule({
      providers: [
        RecentGamesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: ApiService, useValue: apiSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RecentGamesService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array when no recent games in storage', (done) => {
    storageService.getObject.and.returnValue([]);

    service.getRecentGames$().subscribe(games => {
      expect(games).toEqual([]);
      expect(storageService.getObject).toHaveBeenCalledWith('monopoly-banker-recent-games', []);
      done();
    });
  });

  it('should filter out inactive games', (done) => {
    const storedGames: RecentGame[] = [
      { gameID: 'game1', gameLabel: 'Game 1', playerID: 'player1', playerName: 'Player 1' },
      { gameID: 'game2', gameLabel: 'Game 2', playerID: 'player2', playerName: 'Player 2' },
      { gameID: 'game3', gameLabel: 'Game 3', playerID: 'player3', playerName: 'Player 3' }
    ];

    const activeStatus = {
      'game1': true,
      'game2': false,
      'game3': true
    };

    storageService.getObject.and.returnValue(storedGames);
    apiService.gamesStillActive.and.returnValue(of(activeStatus));

    service.getRecentGames$().subscribe(games => {
      expect(games.length).toBe(2);
      expect(games.find(g => g.gameID === 'game1')).toBeTruthy();
      expect(games.find(g => g.gameID === 'game3')).toBeTruthy();
      expect(games.find(g => g.gameID === 'game2')).toBeFalsy();
      expect(storageService.setObject).toHaveBeenCalledWith('monopoly-banker-recent-games', jasmine.any(Array));
      done();
    });
  });

  it('should add new game to recent games', (done) => {
    const existingGames: RecentGame[] = [
      { gameID: 'game1', gameLabel: 'Game 1', playerID: 'player1', playerName: 'Player 1' }
    ];

    const newGame: RecentGame = {
      gameID: 'game2',
      gameLabel: 'Game 2',
      playerID: 'player2',
      playerName: 'Player 2'
    };

    storageService.getObject.and.returnValue(existingGames);
    apiService.gamesStillActive.and.returnValue(of({ 'game1': true }));

    // First call getRecentGames$ to initialize
    service.getRecentGames$().subscribe(() => {
      // Reset the call count
      storageService.setObject.calls.reset();
      
      // Now add a new game
      service.addRecentGame(newGame);

      // Wait a bit for the async operation
      setTimeout(() => {
        expect(storageService.setObject).toHaveBeenCalled();
        const savedGames = storageService.setObject.calls.mostRecent().args[1] as RecentGame[];
        expect(savedGames.length).toBe(2);
        expect(savedGames.find(g => g.gameID === 'game2')).toBeTruthy();
        done();
      }, 100);
    });
  });

  it('should not add duplicate game to recent games', (done) => {
    const existingGames: RecentGame[] = [
      { gameID: 'game1', gameLabel: 'Game 1', playerID: 'player1', playerName: 'Player 1' }
    ];

    const duplicateGame: RecentGame = {
      gameID: 'game1',
      gameLabel: 'Game 1',
      playerID: 'player1',
      playerName: 'Player 1'
    };

    storageService.getObject.and.returnValue(existingGames);
    apiService.gamesStillActive.and.returnValue(of({ 'game1': true }));

    // Try to add a duplicate game
    service.addRecentGame(duplicateGame);

    // Wait a bit for the async operation
    setTimeout(() => {
      // setObject is called once by getRecentGames$ (for filtering), but not a second time for adding
      expect(storageService.setObject).toHaveBeenCalledTimes(1);
      const savedGames = storageService.setObject.calls.mostRecent().args[1] as RecentGame[];
      // Should still be 1 game, not 2
      expect(savedGames.length).toBe(1);
      expect(savedGames[0].gameID).toBe('game1');
      done();
    }, 100);
  });

  it('should handle null storage values', (done) => {
    storageService.getObject.and.returnValue(null);

    service.getRecentGames$().subscribe(games => {
      expect(games).toEqual([]);
      done();
    });
  });

  it('should update storage with filtered games', (done) => {
    const storedGames: RecentGame[] = [
      { gameID: 'game1', gameLabel: 'Game 1', playerID: 'player1', playerName: 'Player 1' },
      { gameID: 'game2', gameLabel: 'Game 2', playerID: 'player2', playerName: 'Player 2' }
    ];

    const activeStatus = {
      'game1': true,
      'game2': false
    };

    storageService.getObject.and.returnValue(storedGames);
    apiService.gamesStillActive.and.returnValue(of(activeStatus));

    service.getRecentGames$().subscribe(games => {
      expect(storageService.setObject).toHaveBeenCalledWith(
        'monopoly-banker-recent-games',
        jasmine.arrayContaining([
          jasmine.objectContaining({ gameID: 'game1' })
        ])
      );
      
      const savedGames = storageService.setObject.calls.mostRecent().args[1] as RecentGame[];
      expect(savedGames.length).toBe(1);
      done();
    });
  });
});
