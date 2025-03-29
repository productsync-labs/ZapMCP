### package.json
```json
{
  "name": "cloudflare-workers-with-typescript",
  "version": "0.0.0",
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20221111.1",
    "typescript": "^4.8.4",
    "wrangler": "^2.4.4"
  },
  "private": true,
  "scripts": {
    "start": "wrangler dev",
    "publish": "wrangler publish"
  },
  "dependencies": {
    "@upstash/redis": "latest"
  }
}

```

### ci.test.ts
```typescript
import {test, expect} from "bun:test"
const deploymentURL = process.env.DEPLOYMENT_URL;
if (!deploymentURL) {
  throw new Error("DEPLOYMENT_URL not set");
}

test("works", async () => {
  console.log({ deploymentURL });
  const url = `${deploymentURL}/`;
  const res = await fetch(url);
  if (res.status !== 200) {
    console.log(await res.text());
  }
  expect(res.status).toEqual(200);
  const json = (await res.json()) as { count: number };
  expect(typeof json.count).toEqual("number");
});

```

### src/index.ts
```typescript
import { Redis } from "@upstash/redis/cloudflare";

export interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

export default {
  async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const redis = Redis.fromEnv(env);

    const count = await redis.incr("cloudflare-workers-with-typescript-count");

    return new Response(JSON.stringify({ count }));
  },
};

```
