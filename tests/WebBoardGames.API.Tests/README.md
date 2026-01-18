# Integration Tests

This project contains integration tests for the Web Board Games API using:
- xUnit for test framework
- Alba for HTTP testing
- Testcontainers for MongoDB instance
- Shouldly for assertions
- Bogus for test data generation
- Moq for mocking (if needed)

## Running Tests

```bash
dotnet test
```

## Test Organization

- `Features/Banker/` - Tests for Monopoly Banker game endpoints
  - `GameCreateEndpointTests` - Tests for game creation
  - `GameJoinEndpointTests` - Tests for joining games
  - `PaymentExecuteEndpointTests` - Tests for payment execution
  
## Test Fixture

The `WebApplicationFixture` provides:
- Shared MongoDB container instance (spun up once per test run)
- Shared Alba host for HTTP requests
- Per-test service scopes for isolation

## Notes

If you encounter issues with Testcontainers not starting MongoDB:
1. Ensure Docker is running and accessible
2. Check Docker socket permissions  
3. Set `TESTCONTAINERS_RYUK_DISABLED=true` if ryuk container causes issues
4. Alternatively, point to a local MongoDB instance by modifying the fixture

The integration tests require Docker to be running for Testcontainers to spin up MongoDB.
