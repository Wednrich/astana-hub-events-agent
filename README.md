# 🤖 Hub Events Agent

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

AI-агент международной техноплатформы **Astana Hub**, который помогает пользователям узнавать о ближайших мероприятиях и команде региональных хабов в **12 городах Казахстана**.

> **Задача (RDO Astana Hub, тестовое задание):** «Пользователь пишет свой город — агент выдаёт всё актуальное: события, форматы, адреса и контакты команды».

---

## ✨ Возможности

| Возможность | Описание |
|---|---|
| 💬 **Чат с AI-агентом** | Поддержка диалога с историей (последние 6 сообщений) на русском языке |
| 🌍 **Авто-распознавание города** | Определяет город из свободного текста на русском, казахском или английском: «привет, я из Тараза», «астанада не іс-шара бар?», «events in Almaty» |
| 🏙 **12 городов** | Astana, Almaty, Shymkent, Qostanai, Pavlodar, Semey, Turkistan, Taldykorgan, Zhezkazgan, Oskemen, Petropavl, Alatau |
| 🎉 **Карточки событий** | Автоматическое определение формата (📍 офлайн / 💻 онлайн / 🔄 гибрид), адрес, дата и время |
| 🔁 **Множество AI-провайдеров** | Автоматический fallback: OpenAI → OpenRouter → Groq → Gemini → локальный режим |
| 🌗 **Тёмная / светлая тема** | Сохраняется в `localStorage`, применяется мгновенно без flash |
| 📱 **Адаптивная вёрстка** | Mobile-first на Tailwind CSS |
| 🧠 **Контекстные ответы** | Агенту передаются актуальные события города + команда хаба — никаких выдумок |
| ⏱ **Long-running API** | Vercel Serverless Functions с таймаутом до 30 секунд для надёжной работы с LLM |

---

## 🏗 Архитектура

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Браузер (React 18)                          │
│                                                                     │
│  ┌──────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
│  │  Header  │  │  ChatContainer   │  │     EventsSection       │   │
│  │ (город,  │  │  ┌────────────┐  │  │  ┌──────────────────┐  │   │
│  │  тема)   │  │  │ ChatMessage│  │  │  │   EventCard × N  │  │   │
│  │          │  │  │     × N    │  │  │  └──────────────────┘  │   │
│  │          │  │  ├────────────┤  │  └─────────────────────────┘   │
│  │          │  │  │ ChatInput  │  │                                 │
│  │          │  │  └────────────┘  │                                 │
│  └──────────┘  └──────────────────┘                                 │
│                         │                                           │
│                  fetch /api/...                                     │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                     Next.js App Router (Node.js)                    │
│                                                                     │
│  POST /api/chat     →  detectCity → loadContext → AI → reply       │
│  GET  /api/events   →  eventLoader → HubEvent[]                    │
│                                                                     │
│  Zustand store  ←── persist ──→ localStorage (theme)              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                               Данные                                │
│                                                                     │
│  src/data/events.json       615 КБ Instagram-постов (raw)          │
│       │                                                             │
│       ▼  eventLoader.ts    Парсинг: title, format, address, time    │
│                                                                     │
│  src/data/mockData.ts      Мок-команды хабов по городам            │
│  src/data/staffContext.ts  Дополнительный контекст команды         │
│  src/types/index.ts        City, HubEvent, Message, ChatSource …   │
└─────────────────────────────────────────────────────────────────────┘
```

### Стек технологий

| Слой         | Технология                                                 |
|--------------|------------------------------------------------------------|
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router)            |
| **UI**        | [React](https://react.dev/) 18 + [Tailwind CSS](https://tailwindcss.com/) 3 + [Framer Motion](https://www.framer.com/motion/) |
| **Язык**      | [TypeScript](https://www.typescriptlang.org/) 5 (strict mode) |
| **State**     | [Zustand](https://github.com/pmndrs/zustand) + `persist` middleware |
| **AI**        | [OpenAI](https://platform.openai.com/) / [OpenRouter](https://openrouter.ai/) / [Groq](https://groq.com/) / [Gemini](https://ai.google.dev/) |
| **Стилизация**| CSS-переменные для темизации без `next-themes`            |
| **Деплой**    | Vercel (Serverless Functions, 30s timeout для `/api/chat`) |

---

## 📂 Структура проекта

```
hub-events-agent/
├── public/                        # Статические файлы
├── src/
│   ├── app/
│   │   ├── layout.tsx             # RootLayout + ThemeProvider
│   │   ├── page.tsx               # Главная страница (Home)
│   │   ├── globals.css            # CSS-переменные темы
│   │   └── api/
│   │       ├── chat/route.ts      # POST /api/chat — AI-агент (517 строк)
│   │       └── events/route.ts    # GET  /api/events?city=…
│   ├── components/
│   │   ├── Header.tsx             # Логотип + CitySelector + ThemeToggle
│   │   ├── ChatContainer.tsx      # Окно чата (скролл, инпут, typing)
│   │   ├── ChatMessage.tsx        # Сообщение (user / agent) с анимацией
│   │   ├── ChatInput.tsx          # Textarea + кнопка отправки
│   │   ├── TypingIndicator.tsx    # Анимация «печатает…»
│   │   ├── EventsSection.tsx      # Сетка карточек событий
│   │   ├── EventCard.tsx          # Карточка одного события
│   │   ├── ThemeProvider.tsx      # Применяет тему к <html>
│   │   └── ThemeToggle.tsx        # Переключатель 🌙 / ☀️
│   ├── data/
│   │   ├── events.json            # ⭐ Instagram-посты (raw, ~615 КБ)
│   │   ├── eventLoader.ts         # Парсер: InstagramPost → HubEvent
│   │   ├── mockData.ts            # Мок-команды хабов по городам
│   │   └── staffContext.ts        # @alisher_hub, @nbnbka и др.
│   ├── hooks/
│   │   └── useTheme.ts            # Обёртка над zustand store
│   ├── store/
│   │   └── themeStore.ts          # Zustand: theme + persist (localStorage)
│   └── types/
│       └── index.ts               # City, HubEvent, Message, ChatSource, …
├── .env.local.example             # Шаблон переменных окружения
├── .gitignore
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json                  # paths: { "@/*": ["./src/*"] }
├── vercel.json                    # 30s timeout для chat API
├── package.json
└── README.md
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd hub-events-agent
npm install
```

### 2. Настройка переменных окружения

Скопируйте шаблон:

```bash
# Windows (CMD)
copy .env.local.example .env.local

# или macOS / Linux / Git Bash
cp .env.local.example .env.local
```

Заполните хотя бы один ключ (если ни одного нет — сработает локальный fallback):

```dotenv
# .env.local

# --- OpenAI (приоритет #1) ---
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# --- OpenRouter (#2) ---
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_TITLE=Hub Events Agent

# --- Groq (#3) ---
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

# --- Google Gemini (#4) ---
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-flash
```

> 💡 Агент автоматически перебирает провайдеров в порядке: **OpenAI → OpenRouter → Groq → Gemini**. Если предыдущий вернул ошибку 429 (rate limit) или недоступен — переключается на следующий. Если все провайдеры отказали — используется `localReply()` с правилами на основе данных.

### 3. Запуск в dev-режиме

```bash
npm run dev
# → http://localhost:3000
```

### 4. Production-сборка

```bash
npm run build
npm start
```

### 5. Проверка типов TypeScript

```bash
npx tsc --noEmit
```

---

## 🔌 API Reference

### `POST /api/chat`

Основной эндпоинт для общения с AI-агентом.

**Request body:**

```json
{
  "message": "Какие события в Астане на этой неделе?",
  "city": "Astana",
  "history": [
    { "role": "user",  "content": "Привет" },
    { "role": "agent", "content": "Здравствуйте!" }
  ]
}
```

| Параметр  | Тип      | Обязательный | По умолчанию | Описание                           |
|-----------|----------|:------------:|:------------:|------------------------------------|
| `message` | `string`  | ✅           | —            | Текст сообщения пользователя       |
| `city`    | `string`  | ❌           | `"Astana"`   | Город (из списка `ALL_CITIES`)     |
| `history` | `object[]`| ❌           | `[]`         | История диалога (до 6 сообщений)   |

**Response:**

```json
{
  "city": "Astana",
  "cityLabel": "Астана",
  "reply": "Ближайшие события в Астане:\n\n1. ...",
  "events": [
    {
      "id": "post_123",
      "title": "Astana Hub Meetup",
      "date": "15 июня 2026 г.",
      "time": "14:00",
      "format": "offline",
      "address": "Astana Hub, каб. 301",
      "description": "Обсуждение новых технологий."
    }
  ],
  "team": [
    { "name": "Алишер Калиев", "role": "Директор", "contact": "@alisher_hub" }
  ],
  "source": "openai",
  "timestamp": 1718000000000
}
```

| Поле        | Тип        | Описание                                   |
|-------------|------------|--------------------------------------------|
| `city`      | `string`   | Определённый город (англ.)                 |
| `cityLabel` | `string`   | Город на русском                           |
| `reply`     | `string`   | Ответ агента (Markdown)                    |
| `events`    | `HubEvent[]`| События, переданные агенту в контекст     |
| `team`      | `TeamMember[]`| Команда хаба в этом городе              |
| `source`    | `string`   | Какой провайдер ответил (`openai` / `openrouter` / `groq` / `gemini` / `local`) |
| `timestamp` | `number`   | Unix-метка времени ответа                 |

### `GET /api/events?city=Almaty`

Получение списка событий по городу.

| Параметр | Описание                                  |
|----------|-------------------------------------------|
| `city`   | Опционально. Без параметра — все события. Если город не из `ALL_CITIES` — `400` с подсказкой. |

**Response:**

```json
{
  "city": "Almaty",
  "count": 7,
  "events": [ /* HubEvent[] */ ]
}
```

---

## 🧠 Как работает агент

### Процесс обработки запроса

```
  Сообщение пользователя
         │
         ▼
  ┌──────────────┐
  │ detectCity() │ ← Сопоставление: RU_TO_CITY / ALL_CITIES
  └──────┬───────┘
         │
         ▼
  ┌──────────────────┐
  │  loadContext()   │ ← Загрузка событий города + команда хаба
  └──────┬───────────┘
         │
         ▼
  ┌──────────────────┐
  │  AI-провайдеры   │ ← OpenAI → OpenRouter → Groq → Gemini → local
  │  (с авто-fallback)│
  └──────┬───────────┘
         │
         ▼
  ┌──────────────┐
  │  parseReply() │ ← Извлечение JSON из ответа LLM
  └──────┬───────┘
         │
         ▼
    Ответ клиенту
```

1. **Определение города.** Текст матчится по регулярным выражениям: сначала русский/казахский (RU_TO_CITY: «астана», «қостанай»…), затем английский (ALL_CITIES). Если ничего не найдено — берётся город, выбранный в шапке.
2. **Подготовка контекста.** Из `events.json` загружаются до 15 последних постов этого города + команда хаба из `mockData.ts`.
3. **Вызов LLM.** Агент получает системный промпт с контекстом и инструкцию «отвечай ТОЛЬКО на русском, кратко, по делу, не выдумывай».
4. **Fallback.** Если все AI-провайдеры вернули ошибку — используется `localReply()` с простыми правилами (показать события / команду / приветствие).

### Парсинг Instagram-постов (`eventLoader.ts`)

| Поле          | Метод извлечения                                               |
|---------------|----------------------------------------------------------------|
| `title`       | Первая строка caption длиной ≥ 4 символа (без эмодзи)          |
| `description` | Следующие 1–3 строки, обрезанные до 320 символов               |
| `format`      | Эвристика: «онлайн»/«zoom» → `online`; «📍»/«хаб» → `offline`; оба → `hybrid` |
| `address`     | Строка после 📍/📌/«Адрес»/«Мекенжай»; fallback: «Astana Hub · {city}» |
| `date`/`time` | `toLocaleString('ru-RU')` из ISO-даты поста                    |

---

## 🌗 Тёмная / светлая тема

Тема хранится в `localStorage` через `zustand/middleware persist`. Применяется к `<html>` через `ThemeProvider` (без `next-themes`, без flash при загрузке).

CSS-переменные в `globals.css`:

```css
:root {
  --bg-primary: #f8f9fa;
  --bg-user-msg: #e3f2fd;
  --bg-agent-msg: #ffffff;
  --text-primary: #1a1a2e;
  --border-color: #e0e0e0;
  --icon-color: #405de6;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

[data-theme="dark"] {
  --bg-primary: #0f0f23;
  --bg-user-msg: #1a1a3e;
  --bg-agent-msg: #1e1e3a;
  --text-primary: #e0e0ff;
  --border-color: #2a2a4a;
  --icon-color: #6c7bff;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
```

---

## ☁️ Деплой на Vercel

Проект готов к деплою на Vercel:

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

**Важно:** В `vercel.json` настроен таймаут 30 секунд для `/api/chat`, так как LLM-запросы могут выполняться дольше стандартных 10 секунд Vercel Serverless Functions.

Переменные окружения необходимо добавить в **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## 🧪 Локальный fallback-режим

Если **ни один** API-ключ не задан, агент работает в режиме `local`:

- **Приветствие** — отвечает на «привет», «здравствуйте» и т.д.
- **События** — показывает список событий из `events.json` для города пользователя
- **Команда** — показывает состав хаба из `mockData.ts`
- **Помощь** — список доступных команд по городам
- **Неизвестный запрос** — предлагает написать «покажи события» или «команда»

Это позволяет тестировать интерфейс и данные без API-ключей.

---

## 🛣 Roadmap

- [x] Чат с AI-агентом и отображение событий
- [x] Авто-распознавание города из текста
- [x] Поддержка 4 AI-провайдеров с fallback
- [x] Тёмная / светлая тема
- [x] Извлечение профилей сотрудников
- [x] **Поиск по всем хабам сразу** в UI
- [x] **Публичный деплой** + демо-видео 1–2 мин

---

## 📝 Лицензия

MIT © 2025–2026 RDO Astana Hub

---

<p align="center">
  <sub>Built with ❤️ for RDO Astana Hub</sub>
  <br/>
  <sub>Next.js · React · TypeScript · Tailwind CSS · Zustand · OpenAI</sub>
</p>
