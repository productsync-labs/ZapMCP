### package.json
```json
{
  "name": "auto-pipeline",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@upstash/redis": "latest",
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

### app/data/getEvents.ts
```typescript

import client from "./redis"

export async function getEvents() {
  const keys = await client.scan(0, { match: 'event:*' });

  if (keys[1].length === 0) {
    // If no keys found, insert sample data
    client.hmset('event:1', {'name': 'Sample Event 1', 'date': '2024-05-13'});
    client.hmset('event:2', {'name': 'Sample Event 2', 'date': '2024-05-14'});
    // Add more sample events as needed
  }

  const events = await Promise.all(keys[1].map(async key => {
    return client.hgetall(key) ?? {name: "default", date: "2000-01-01"};
  }));
  return events as {name: string, date: string}[]
};

```

### app/data/getUsers.ts
```typescript

import client from "./redis"

export async function getUsers() {
  const keys = await client.scan(0, { match: 'user:*' });

  if (keys[1].length === 0) {
    // If no keys found, insert sample data
    client.hmset('user:1', {'username': 'Adam', 'birthday': '1990-01-01'});
    client.hmset('user:2', {'username': 'Eve', 'birthday': '1980-01-05'});
    // Add more sample users as needed
  }

  const users = await Promise.all(keys[1].map(async key => {
    return client.hgetall(key) ?? {username: "default", birthday: "2000-01-01"};
  }));
  return users as {username: string, birthday: string}[]
}
```

### app/data/redis.ts
```typescript

import { Redis } from '@upstash/redis'

export const LATENCY_LOGGING = true
export const ENABLE_AUTO_PIPELINING = true

const client = Redis.fromEnv({
  latencyLogging: LATENCY_LOGGING,
  enableAutoPipelining: ENABLE_AUTO_PIPELINING
});

export default client;

```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

```
