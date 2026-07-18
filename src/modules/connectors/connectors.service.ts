import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  CONNECTOR_WEBHOOK_QUEUE,
  ConnectorWebhookJob,
} from './connector-webhook.processor';

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectQueue(CONNECTOR_WEBHOOK_QUEUE)
    private readonly webhookQueue: Queue<ConnectorWebhookJob>,
  ) {}

  enqueueWebhook(provider: string, payload: Record<string, unknown>) {
    return this.webhookQueue.add(
      'inbound',
      {
        provider,
        payload,
        receivedAt: new Date().toISOString(),
      },
      { removeOnComplete: 100, removeOnFail: 50 },
    );
  }
}
