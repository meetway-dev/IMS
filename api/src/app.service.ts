import { Injectable } from '@nestjs/common';

/** Root application service -- provides basic health / info responses. */
@Injectable()
export class AppService {
  getStatus() {
    return {
      status: 'ok',
      service: 'IMS API',
      timestamp: new Date().toISOString(),
    };
  }
}
