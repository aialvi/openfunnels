FROM composer:2 AS php-dependencies
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --optimize-autoloader --ignore-platform-reqs

FROM node:22-alpine AS frontend
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY resources ./resources
COPY public ./public
COPY components.json tsconfig.json vite.config.ts ./
RUN pnpm run build

FROM php:8.4-cli-alpine AS application
RUN apk add --no-cache icu-libs libzip sqlite-libs \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev sqlite-dev \
    && docker-php-ext-install intl mbstring pcntl pdo_sqlite zip \
    && apk del .build-deps

WORKDIR /app
COPY . .
COPY --from=php-dependencies /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs /data \
    && chmod -R 775 storage bootstrap/cache /data

EXPOSE 8000
ENTRYPOINT ["sh", "/app/docker/entrypoint.sh"]
CMD ["web"]
