import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export const CONNECTOR_WEBHOOK_QUEUE = 'connector-webhooks';

export type ConnectorWebhookJob = {
  provider: string;
  payload: Record<string, unknown>;
  receivedAt: string;
};

@Processor(CONNECTOR_WEBHOOK_QUEUE)
export class ConnectorWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(ConnectorWebhookProcessor.name);

  process(job: Job<ConnectorWebhookJob>): Promise<void> {
    this.logger.log(
      `Processed webhook job ${job.id} for provider=${job.data.provider}`,
    );
    return Promise.resolve();
  }
}
