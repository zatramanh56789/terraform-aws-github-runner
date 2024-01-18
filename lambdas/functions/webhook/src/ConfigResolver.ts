import { getParameter } from '@terraform-aws-github-runner/aws-ssm-util';
import { QueueConfig } from './sqs';

export class Config {
  repositoryAllowList: Array<string>;
  queuesConfig: Array<QueueConfig>;
  workflowJobEventSecondaryQueue: string | undefined;

  constructor(
    repositoryAllowList: Array<string>,
    queuesConfig: Array<QueueConfig>,
    workflowJobEventSecondaryQueue: string | undefined,
  ) {
    this.repositoryAllowList = repositoryAllowList;
    this.queuesConfig = queuesConfig;
    this.workflowJobEventSecondaryQueue = workflowJobEventSecondaryQueue;
  }

  static async load(): Promise<Config> {
    const repositoryAllowListEnv = process.env.REPOSITORY_ALLOW_LIST ?? '[]';
    const repositoryAllowList = JSON.parse(repositoryAllowListEnv) as Array<string>;
    const queuesConfigPath = process.env.PARAMETER_QUEUES_CONFIG_PATH ?? '/github-runner/queues-config';
    const queuesConfigVal = await getParameter(queuesConfigPath);
    const queuesConfig = JSON.parse(queuesConfigVal) as Array<QueueConfig>;
    const workflowJobEventSecondaryQueue = process.env.SQS_WORKFLOW_JOB_QUEUE ?? undefined;
    return new Config(repositoryAllowList, queuesConfig, workflowJobEventSecondaryQueue);
  }
}
