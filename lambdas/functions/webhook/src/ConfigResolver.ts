import { getParameter } from '@terraform-aws-github-runner/aws-ssm-util';
import { RunnerMatcherConfig } from './sqs';
import { logger } from '@terraform-aws-github-runner/aws-powertools-util';

export class Config {
  repositoryAllowList: Array<string>;
  static matcherConfig: Array<RunnerMatcherConfig> | undefined;
  static webhookSecret: string | undefined;
  workflowJobEventSecondaryQueue: string | undefined;

  constructor(repositoryAllowList: Array<string>, workflowJobEventSecondaryQueue: string | undefined) {
    this.repositoryAllowList = repositoryAllowList;

    this.workflowJobEventSecondaryQueue = workflowJobEventSecondaryQueue;
  }

  static async load(): Promise<Config> {
    const repositoryAllowListEnv = process.env.REPOSITORY_ALLOW_LIST ?? '[]';
    const repositoryAllowList = JSON.parse(repositoryAllowListEnv) as Array<string>;
    // load the queues config from SSM if it's not already loaded and cached
    if (!Config.matcherConfig) {
      const queuesConfigPath =
        process.env.PARAMETER_RUNNER_MATCHER_CONFIG_PATH ?? '/github-runner/runner-matcher-config';
      const [queuesConfigVal, webhookSecret] = await Promise.all([
        getParameter(queuesConfigPath),
        getParameter(process.env.PARAMETER_GITHUB_APP_WEBHOOK_SECRET),
      ]);
      Config.webhookSecret = webhookSecret;
      Config.matcherConfig = JSON.parse(queuesConfigVal) as Array<RunnerMatcherConfig>;
      logger.debug('Loaded queues config', { matcherConfig: Config.matcherConfig });
    }
    const workflowJobEventSecondaryQueue = process.env.SQS_WORKFLOW_JOB_QUEUE ?? undefined;
    return new Config(repositoryAllowList, workflowJobEventSecondaryQueue);
  }

  static reset(): void {
    Config.matcherConfig = undefined;
  }
}
