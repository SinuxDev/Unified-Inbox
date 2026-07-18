import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  CONNECTOR_WEBHOOK_QUEUE,
  ConnectorWebhookProcessor,
} from './connector-webhook.processor';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsService } from './connectors.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CONNECTOR_WEBHOOK_QUEUE,
    }),
  ],
  controllers: [ConnectorsController],
  providers: [ConnectorsService, ConnectorWebhookProcessor],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
