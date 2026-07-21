# Docker Evaluation Stack

The included Compose stack is the fastest way to evaluate OpenFunnels locally. It is intentionally an application-only setup and does not provision TLS, a reverse proxy, or custom-domain infrastructure.

## Start

```bash
docker compose up --build
```

Open <http://localhost:8000> and choose **Launch Demo**, or register a persistent local account. The stack runs the Laravel application, queue worker, scheduler, compiled frontend, and a shared SQLite database.

## Operations

```bash
# Follow logs
docker compose logs -f

# Stop while preserving data
docker compose down

# Reset all local evaluation data
docker compose down --volumes

# Rebuild after pulling updates
docker compose up --build --detach
```

The `openfunnels-data` volume stores SQLite data across restarts. The Compose application key is public and intended only for local evaluation. Set a private `APP_KEY` and follow [the production self-hosting guide](self-hosting.md) for real deployments.

## Health

The web container exposes Laravel's `/up` health endpoint. Queue and scheduler containers wait for the web migration step before starting.
