import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, GameCreateRequest, GameJoinRequest, specialPlayerID_Bank, specialPlayerID_FreeParking } from './api-service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

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
});
