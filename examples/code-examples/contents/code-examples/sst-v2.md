### package.json
```json
{
  "name": "sst-v2",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "sst dev",
    "build": "sst build",
    "deploy": "sst deploy",
    "remove": "sst remove",
    "console": "sst console",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@tsconfig/node18": "^18.2.4",
    "aws-cdk-lib": "2.142.1",
    "constructs": "10.3.0",
    "sst": "^2.43.4",
    "typescript": "^5.5.4"
  },
  "workspaces": [
    "packages/*"
  ],
  "dependencies": {
    "@upstash/redis": "latest"
  }
}

```

### packages/core/sst-env.d.ts
```typescript
/// <reference path="../../.sst/types/index.ts" />

```

### packages/functions/sst-env.d.ts
```typescript
/// <reference path="../../.sst/types/index.ts" />

```

### packages/web/pages/api/hello.ts
```typescript
import { Redis } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import { Config } from "sst/node/config";

const redis = new Redis({
  url: Config.UPSTASH_REDIS_REST_URL,
  token: Config.UPSTASH_REDIS_REST_TOKEN,
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const count = await redis.incr("counter");
  res.status(200).json({ count });
}
```

### packages/web/sst-env.d.ts
```typescript
/// <reference path="../../.sst/types/index.ts" />

```

### sst.config.ts
```typescript
import { SSTConfig } from "sst";
import { Default } from "./stacks/Default";

export default {
  config(_input) {
    return {
      name: "sst-v2",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(Default);
  }
} satisfies SSTConfig;

```

### stacks/Default.ts
```typescript
import { Config, StackContext, NextjsSite } from "sst/constructs";

export function Default({ stack }: StackContext) {
  const UPSTASH_REDIS_REST_URL = new Config.Secret(stack, "UPSTASH_REDIS_REST_URL");
  const UPSTASH_REDIS_REST_TOKEN = new Config.Secret(stack, "UPSTASH_REDIS_REST_TOKEN");
  const site = new NextjsSite(stack, "site", {
    bind: [UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN],
    path: "packages/web",
  });
  stack.addOutputs({
    SiteUrl: site.url,
  });
}
```
