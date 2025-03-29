### main.test.ts
```typescript
import { test, expect } from "bun:test";

const deploymentURL = process.env.DEPLOYMENT_URL;
if (!deploymentURL) {
  throw new Error("DEPLOYMENT_URL not set");
}

test("works", async () => {
  console.log({ deploymentURL });
  const res = await fetch(deploymentURL);
  const body = await res.text();
  console.log({ body });
  expect(res.status).toBe(200);
  const json = JSON.parse(body) as { counter: number };
  expect(typeof json.counter).toBe("number");
});

```

### main.ts
```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Redis } from "https://esm.sh/@upstash/redis@latest";

serve(async (_req: Request) => {
  const redis = Redis.fromEnv();
  const counter = await redis.incr("deno deploy counter");

  return new Response(JSON.stringify({ counter }), { status: 200 });
});

```
