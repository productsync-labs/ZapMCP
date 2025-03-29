### package.json
```json
{
  "name": "aws-cdk-typescript",
  "version": "0.1.0",
  "bin": {
    "aws-cdk-typescript": "bin/aws-cdk-typescript.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest",
    "cdk": "cdk"
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "20.14.2",
    "aws-cdk": "2.147.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.4",
    "ts-node": "^10.9.2",
    "typescript": "~5.4.5"
  },
  "dependencies": {
    "@upstash/redis": "latest",
    "aws-cdk-lib": "2.147.2",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  }
}

```

### api/counter.ts
```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const handler = async function() {
    const count = await redis.incr("counter");
    return {
        statusCode: 200,
        body: JSON.stringify('Counter: ' + count),
    };
};

```

### bin/aws-cdk-typescript.ts
```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkTypescriptStack } from '../lib/aws-cdk-typescript-stack';

const app = new cdk.App();
new AwsCdkTypescriptStack(app, 'AwsCdkTypescriptStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
```

### lib/aws-cdk-typescript-stack.ts
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export class AwsCdkTypescriptStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const counterFunction = new nodejs.NodejsFunction(this, 'CounterFunction', {
      entry: 'api/counter.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
      },
      bundling: {
        format: nodejs.OutputFormat.ESM,
        target: "node20",
        nodeModules: ['@upstash/redis'],
      },
    });

    const counterFunctionUrl = counterFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "counterFunctionUrlOutput", {
      value: counterFunctionUrl.url,
    })
  }
}

```

### test/aws-cdk-typescript.test.ts
```typescript
// import * as cdk from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
// import * as AwsCdkTypescript from '../lib/aws-cdk-typescript-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-cdk-typescript-stack.ts
test('SQS Queue Created', () => {
//   const app = new cdk.App();
//     // WHEN
//   const stack = new AwsCdkTypescript.AwsCdkTypescriptStack(app, 'MyTestStack');
//     // THEN
//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
});

```
