### package.json
```json
{
  "name": "cloudflare-workers",
  "version": "1.0.0",
  "description": "Example project using wrangler2",
  "author": "Andreas Thomas <dev@chronark.com>",
  "license": "MIT",
  "scripts": {
    "start": "wrangler dev",
    "publish": "wrangler publish"
  },
  "devDependencies": {
    "wrangler": "^2.20.0"
  },
  "dependencies": {
    "@upstash/redis": "latest"
  }
}

```

### ci.test.ts
```typescript
import { expect, test } from "bun:test";

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
