import { getParameter } from '@terraform-aws-github-runner/aws-ssm-util';
import { QueueConfig } from './sqs';
import { logger } from '@terraform-aws-github-runner/aws-powertools-util';

export class Config {
  repositoryAllowList: Array<string>;
  static queuesConfig: Array<QueueConfig>;
  workflowJobEventSecondaryQueue: string | undefined;

  constructor(repositoryAllowList: Array<string>, workflowJobEventSecondaryQueue: string | undefined) {
    this.repositoryAllowList = repositoryAllowList;

    this.workflowJobEventSecondaryQueue = workflowJobEventSecondaryQueue;
  }

  static async load(): Promise<Config> {
    const repositoryAllowListEnv = process.env.REPOSITORY_ALLOW_LIST ?? '[]';
    const repositoryAllowList = JSON.parse(repositoryAllowListEnv) as Array<string>;
    // load the queues config from SSM if it's not already loaded and cached
    if (!Config.queuesConfig) {
      const queuesConfigPath = process.env.PARAMETER_QUEUES_CONFIG_PATH ?? '/github-runner/queues-config';
      const queuesConfigVal = await getParameter(queuesConfigPath);
      Config.queuesConfig = JSON.parse(queuesConfigVal) as Array<QueueConfig>;
      logger.debug('Loaded queues config', { queuesConfig: Config.queuesConfig });
    }
    const workflowJobEventSecondaryQueue = process.env.SQS_WORKFLOW_JOB_QUEUE ?? undefined;
    return new Config(repositoryAllowList, workflowJobEventSecondaryQueue);
  }
}
