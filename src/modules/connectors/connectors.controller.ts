import { Body, Controller, Param, Post } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Post('webhooks/:provider')
  async receiveWebhook(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const job = await this.connectorsService.enqueueWebhook(provider, payload);
    return { accepted: true, jobId: job.id, provider };
  }
}
