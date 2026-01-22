# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# These ARGs allow for swapping out the base used to make the final image when debugging from VS
ARG LAUNCHING_FROM_VS
# This sets the base image for final, but only if LAUNCHING_FROM_VS has been defined
ARG FINAL_BASE_IMAGE=${LAUNCHING_FROM_VS:+aotdebug}

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080


# This stage is used to build the service project

# Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
# Install dependencies for .NET and Node/Angular
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    clang zlib1g-dev curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g @angular/cli \
    && rm -rf /var/lib/apt/lists/*
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["WebBoardGames.API/WebBoardGames.API.csproj", "WebBoardGames.API/"]
RUN dotnet restore "./WebBoardGames.API/WebBoardGames.API.csproj"
COPY . .

ARG BUILD_VERSION

# Build Angular app
WORKDIR /src/WebBoardGames.API/angular-ui
RUN npm ci && VERSION=$BUILD_VERSION && npm run build -- --output-path=dist

# Build .NET app
WORKDIR /src/WebBoardGames.API
RUN dotnet build "./WebBoardGames.API.csproj" -c $BUILD_CONFIGURATION -o /app/build -p:Version=$BUILD_VERSION

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./WebBoardGames.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=true
# Copy Angular build output to publish directory
RUN cp -r /src/WebBoardGames.API/angular-ui/dist /app/publish/angular-ui

# This stage is used as the base for the final stage when launching from VS to support debugging in regular mode (Default when not using the Debug configuration)
FROM base AS aotdebug
USER root
# Install GDB to support native debugging
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gdb
USER app

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM ${FINAL_BASE_IMAGE:-mcr.microsoft.com/dotnet/aspnet:10.0} AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .

HEALTHCHECK --interval=1s --timeout=3s \
    CMD curl http://localhost:8080/api/monitoring/health || exit 1

ENTRYPOINT ["./WebBoardGames.API"]