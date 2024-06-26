#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RdsIamTokenAuthStack } from './stack';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
new RdsIamTokenAuthStack(app, 'RdsIamTokenAuthStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Specialize this stack for the AWS Account and Region that are implied by the
   * current CLI configuration. */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
