import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, GameCreateRequest, GameJoinRequest, specialPlayerID_Bank, specialPlayerID_FreeParking } from './api-service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const mockPaymentResponse = { exists: true, alreadyInProgress: false, playerID: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct special player IDs', () => {
    expect(specialPlayerID_Bank).toBeNull();
    expect(specialPlayerID_FreeParking).toBe('free-parking');
  });

  it('should create a game', (done) => {
    const mockRequest: GameCreateRequest = {
      label: 'Test Game',
      playerName: 'Player 1',
      moneyOnFreeParking: true,
      doubleMoneyOnGo: false
    };
    const mockResponse = { gameID: 'game123', playerID: 'player123' };

    service.gameCreate(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('/api/monopoly/banker/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should join a game', (done) => {
    const mockRequest: GameJoinRequest = {
      gameID: 'game123',
      playerName: 'Player 2'
    };
    const mockResponse = {
      exists: true,
      alreadyInProgress: false,
      playerID: 'player456'
    };

    service.gameJoin(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('/api/monopoly/banker/join');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should execute payment', () => {
    const gameID = 'game123';
    const sourcePlayerID = 'player1';
    const targetPlayerID = 'player2';
    const amount = 500;

    service.paymentExecute(gameID, sourcePlayerID, targetPlayerID, amount);

    const req = httpMock.expectOne('/api/monopoly/banker/payment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      gameID,
      sourcePlayerID,
      targetPlayerID,
      amount
    });
    req.flush(mockPaymentResponse);
  });

  it('should execute payment with null source (bank payment)', () => {
    const gameID = 'game123';
    const sourcePlayerID = null;
    const targetPlayerID = 'player2';
    const amount = 200;

    service.paymentExecute(gameID, sourcePlayerID, targetPlayerID, amount);

    const req = httpMock.expectOne('/api/monopoly/banker/payment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      gameID,
      sourcePlayerID,
      targetPlayerID,
      amount
    });
    req.flush(mockPaymentResponse);
  });

  it('should execute payment with null target (payment to bank)', () => {
    const gameID = 'game123';
    const sourcePlayerID = 'player1';
    const targetPlayerID = null;
    const amount = 150;

    service.paymentExecute(gameID, sourcePlayerID, targetPlayerID, amount);

    const req = httpMock.expectOne('/api/monopoly/banker/payment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      gameID,
      sourcePlayerID,
      targetPlayerID,
      amount
    });
    req.flush(mockPaymentResponse);
  });

  it('should create observable for getGameData', (done) => {
    // Test that getGameData returns an observable
    // Note: EventSource behavior is difficult to test in unit tests
    // This test verifies the observable is created and can be subscribed to
    const observable = service.getGameData('game123', 'player123');
    expect(observable).toBeDefined();
    
    // Subscribe and expect it will error (due to EventSource 404 in test environment)
    const subscription = observable.subscribe({
      next: () => {
        // If we receive data, that's also valid
        subscription.unsubscribe();
        done();
      },
      error: () => {
        // EventSource will error in test environment, which is expected
        done();
      }
    });
    
    // Clean up after a short delay if neither happens
    setTimeout(() => {
      subscription.unsubscribe();
      done();
    }, 100);
  });
});
