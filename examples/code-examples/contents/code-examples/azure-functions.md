### package.json
```json
{
  "name": "",
  "version": "1.0.0",
  "description": "",
  "main": "dist/src/functions/*.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "clean": "rimraf dist",
    "prestart": "npm run clean && npm run build",
    "start": "func start",
    "test": "echo \"No tests yet...\""
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "@upstash/redis": "latest"
  },
  "devDependencies": {
    "@types/node": "18.x",
    "azure-functions-core-tools": "^4.x",
    "rimraf": "^5.0.0",
    "typescript": "^4.0.0"
  }
}

```

### src/functions/CounterFunction.ts
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export async function CounterFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const count = await redis.incr("counter");

    return { status: 200, body: `Counter: ${count}` };
};

app.http('CounterFunction', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: CounterFunction
});
```
