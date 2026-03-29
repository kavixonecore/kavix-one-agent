import { TemplateType } from "../../../src/core/enums/index.mjs";

import type {
  IFeatureSpec,
  IGeneratedFile,
  IGenerationContext,
  IRenderedFile,
  ITemplate,
  IValidationResult,
} from "../../../src/core/interfaces/index.mjs";

/**
 * AWS CDK addon template.
 * Generates CDK TypeScript infrastructure files for an Elysia API project.
 * Stack includes: VPC, ECS Fargate, DocumentDB, SQS (optional), Secrets Manager.
 */
export const awsCdkTemplate: ITemplate = {

  name: "aws-cdk",
  type: TemplateType.ADDON,
  description: "Generates AWS CDK TypeScript infrastructure files (VPC, ECS Fargate, DocumentDB, SQS optional, Secrets Manager)",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    return [
      {
        path: "infrastructure/cdk/bin/app.ts",
        description: "CDK app entry point",
        templateName: "aws-cdk",
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/lib/stack.ts",
        description: "CDK stack with all AWS resources",
        templateName: "aws-cdk",
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/cdk.json",
        description: "CDK configuration file",
        templateName: "aws-cdk",
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/package.json",
        description: "CDK package dependencies",
        templateName: "aws-cdk",
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/tsconfig.json",
        description: "TypeScript config for CDK project",
        templateName: "aws-cdk",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const { projectName } = context;
    const hasQueue = feature.description?.toLowerCase()
.includes("queue") ?? false;
    const pascalName = toPascalCase(projectName);

    return [
      {
        path: "infrastructure/cdk/bin/app.ts",
        content: renderApp(projectName, pascalName),
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/lib/stack.ts",
        content: renderStack(projectName, pascalName, hasQueue),
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/cdk.json",
        content: renderCdkJson(projectName),
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/package.json",
        content: renderPackageJson(projectName),
        featureName: feature.name,
      },
      {
        path: "infrastructure/cdk/tsconfig.json",
        content: renderTsConfig(),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const expectedPaths = [
      "infrastructure/cdk/bin/app.ts",
      "infrastructure/cdk/lib/stack.ts",
      "infrastructure/cdk/cdk.json",
      "infrastructure/cdk/package.json",
      "infrastructure/cdk/tsconfig.json",
    ];

    for (const expected of expectedPaths) {
      if (!files.some((f) => f.path === expected)) {
        errors.push(`Missing required file: ${expected}`);
      }
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0)
.toUpperCase() + word.slice(1)
.toLowerCase())
    .join("");
}

function renderApp(projectName: string, pascalName: string): string {
  return `#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ${pascalName}Stack } from "../lib/stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
};

new ${pascalName}Stack(app, \`\${process.env.ENVIRONMENT ?? "dev"}-${projectName}\`, {
  env,
  projectName: "${projectName}",
  environment: process.env.ENVIRONMENT ?? "dev",
});
`;
}

function renderStack(projectName: string, pascalName: string, includeQueue: boolean): string {
  const queueImport = includeQueue ? `import * as sqs from "aws-cdk-lib/aws-sqs";\n` : "";
  const queueProp = includeQueue
    ? `\n  readonly queue: sqs.Queue;`
    : "";
  const queueResource = includeQueue
    ? `
    // SQS Queue
    this.queue = new sqs.Queue(this, "Queue", {
      queueName: \`\${props.environment}-\${props.projectName}-queue\`,
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.days(14),
      deadLetterQueue: {
        queue: new sqs.Queue(this, "DeadLetterQueue", {
          queueName: \`\${props.environment}-\${props.projectName}-dlq\`,
        }),
        maxReceiveCount: 3,
      },
    });

    // Grant queue permissions to task role
    this.queue.grantSendMessages(taskRole);
    this.queue.grantConsumeMessages(taskRole);
`
    : "";

  const queueEnv = includeQueue
    ? `
          { name: "SQS_QUEUE_URL", value: this.queue.queueUrl },
`
    : "";

  return `import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as docdb from "aws-cdk-lib/aws-docdb";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
${queueImport}import { Construct } from "constructs";

export interface ${pascalName}StackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
}

/**
 * Main CDK stack for ${projectName}.
 * Resources: VPC, ECS Fargate, DocumentDB, Secrets Manager${includeQueue ? ", SQS Queue" : ""}.
 */
export class ${pascalName}Stack extends cdk.Stack {

  readonly service: ecsPatterns.ApplicationLoadBalancedFargateService;
  readonly cluster: ecs.Cluster;
  readonly dbCluster: docdb.DatabaseCluster;${queueProp}

  public constructor(scope: Construct, id: string, props: ${pascalName}StackProps) {
    super(scope, id, props);

    const { projectName, environment } = props;
    const prefix = \`\${environment}-\${projectName}\`;

    // ---------------------------------------------------------------------------
    // VPC
    // ---------------------------------------------------------------------------
    const vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: \`\${prefix}-vpc\`,
      maxAzs: 2,
      natGateways: 1,
    });

    // ---------------------------------------------------------------------------
    // DocumentDB (MongoDB-compatible)
    // ---------------------------------------------------------------------------
    const dbSecret = new secretsManager.Secret(this, "DbSecret", {
      secretName: \`\${prefix}/docdb-credentials\`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "admin" }),
        generateStringKey: "password",
        excludeCharacters: "/@\\" \`",
      },
    });

    this.dbCluster = new docdb.DatabaseCluster(this, "DocDb", {
      masterUser: {
        username: dbSecret.secretValueFromJson("username").unsafeUnwrap(),
        password: dbSecret.secretValueFromJson("password"),
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      instances: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      vpc,
      dbClusterName: \`\${prefix}-docdb\`,
      deletionProtection: environment === "prod",
    });

    // ---------------------------------------------------------------------------
    // ECS Cluster
    // ---------------------------------------------------------------------------
    this.cluster = new ecs.Cluster(this, "Cluster", {
      clusterName: \`\${prefix}-cluster\`,
      vpc,
      containerInsights: true,
    });

    // ---------------------------------------------------------------------------
    // Task Role
    // ---------------------------------------------------------------------------
    const taskRole = new iam.Role(this, "TaskRole", {
      roleName: \`\${prefix}-task-role\`,
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    dbSecret.grantRead(taskRole);
    ${queueResource}
    // ---------------------------------------------------------------------------
    // Log Group
    // ---------------------------------------------------------------------------
    const logGroup = new logs.LogGroup(this, "LogGroup", {
      logGroupName: \`/ecs/\${prefix}\`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ---------------------------------------------------------------------------
    // Fargate Service
    // ---------------------------------------------------------------------------
    this.service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Service", {
      cluster: this.cluster,
      serviceName: \`\${prefix}-api\`,
      cpu: 512,
      memoryLimitMiB: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(\`\${projectName}:latest\`),
        containerPort: 3000,
        taskRole,
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: prefix,
          logGroup,
        }),
        environment: {
          NODE_ENV: environment,
          PROJECT_NAME: projectName,
          MONGODB_URI: \`mongodb://\${dbSecret.secretValueFromJson("username").unsafeUnwrap()}:\${dbSecret.secretValueFromJson("password").unsafeUnwrap()}@\${this.dbCluster.clusterEndpoint.hostname}:27017/${projectName}?tls=true&tlsCAFile=global-bundle.pem\`,
          ${queueEnv}
        },
      },
      publicLoadBalancer: true,
      desiredCount: environment === "prod" ? 2 : 1,
    });

    this.service.targetGroup.configureHealthCheck({ path: "/healthz" });

    // ---------------------------------------------------------------------------
    // Stack Outputs
    // ---------------------------------------------------------------------------
    new cdk.CfnOutput(this, "LoadBalancerDns", {
      value: this.service.loadBalancer.loadBalancerDnsName,
      description: "Load Balancer DNS name",
    });

    new cdk.CfnOutput(this, "ServiceUrl", {
      value: \`http://\${this.service.loadBalancer.loadBalancerDnsName}\`,
      description: "API service URL",
    });
  }
}
`;
}

function renderCdkJson(projectName: string): string {
  return JSON.stringify(
    {
      app: "npx ts-node --prefer-ts-exts bin/app.ts",
      watch: {
        include: ["**"],
        exclude: [
          "README.md",
          "cdk*.json",
          "**/*.d.ts",
          "**/*.js",
          "tsconfig.json",
          "node_modules",
          "test",
        ],
      },
      context: {
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/core:checkSecretUsage": true,
        "@aws-cdk/core:target-partitions": ["aws", "aws-cn"],
        "project": projectName,
      },
    },
    null,
    2
  );
}

function renderPackageJson(projectName: string): string {
  return JSON.stringify(
    {
      name: `${projectName}-cdk`,
      version: "0.1.0",
      bin: { [projectName]: "bin/app.js" },
      scripts: {
        build: "tsc",
        watch: "tsc -w",
        test: "jest",
        cdk: "cdk",
        synth: "cdk synth",
        deploy: "cdk deploy",
        diff: "cdk diff",
        destroy: "cdk destroy",
      },
      devDependencies: {
        "@types/node": "20.x",
        "aws-cdk": "2.x",
        "jest": "^29.7.0",
        "ts-jest": "^29.1.0",
        "ts-node": "^10.9.2",
        "typescript": "~5.4.5",
      },
      dependencies: {
        "aws-cdk-lib": "2.x",
        "constructs": "^10.0.0",
        "source-map-support": "^0.5.21",
      },
    },
    null,
    2
  );
}

function renderTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["es2020"],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        outDir: "./dist",
        rootDir: "./",
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
      exclude: ["node_modules", "cdk.out"],
    },
    null,
    2
  );
}
