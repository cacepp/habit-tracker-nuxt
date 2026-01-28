# Habit Tracker (Nuxt 3)

Веб-приложение для отслеживания ежедневных привычек с аналитикой прогресса.

Пользователь может создавать привычки, отмечать их выполнение каждый день и анализировать свою статистику.

## Используемый стек технологий:

- Vue 3 + Nuxt 3
- TypeScript
- Pinia
- Nuxt UI
- IndexedDB
- Chart.js + vue-chartjs
- VueUse

Все данные сохраняются локально в браузере через IndexedDB:

- Привычки (ключ "habits")
- Записи выполнения (ключ "entries")
- Единицы измерения (ключ "units")

## Запуск проекта

### Склонировать репозиторий и установить зависимости:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Запустить локальный dev-сервер:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun --bun run dev
```

### После запуска приложение будет доступно по адресу:

```
http://localhost:3000
```
