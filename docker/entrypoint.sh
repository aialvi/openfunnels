#!/bin/sh
set -eu

mkdir -p "$(dirname "${DB_DATABASE:-/data/database.sqlite}")"
touch "${DB_DATABASE:-/data/database.sqlite}"

wait_for_database() {
    attempts=0
    until php artisan migrate:status >/dev/null 2>&1; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 30 ]; then
            echo "Database did not become ready."
            exit 1
        fi
        sleep 2
    done
}

case "${1:-web}" in
    web)
        php artisan migrate --force
        php artisan storage:link >/dev/null 2>&1 || true
        exec php artisan serve --host=0.0.0.0 --port=8000
        ;;
    queue)
        wait_for_database
        exec php artisan queue:work --sleep=2 --tries=3 --timeout=90
        ;;
    scheduler)
        wait_for_database
        exec php artisan schedule:work
        ;;
    *)
        exec "$@"
        ;;
esac
