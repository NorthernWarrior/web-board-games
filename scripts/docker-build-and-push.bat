REM Set DOCKER_REGISTRY and BUILD_VERSION as Batch variables
SET DOCKER_REGISTRY=ghcr.io/northernwarrior/
SET BUILD_VERSION=1.0.3

docker buildx build ^
    --build-arg BUILD_VERSION=%BUILD_VERSION% ^
    -t %DOCKER_REGISTRY%web-board-games:latest ^
    -t %DOCKER_REGISTRY%web-board-games:%BUILD_VERSION% ^
    -f WebBoardGames.API/Dockerfile ^
    --push .
    