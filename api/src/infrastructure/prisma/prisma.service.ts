import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    super({ adapter: new PrismaPg(pool) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma v7+ types no longer include beforeExit typing by default.
    // We still want graceful Nest shutdown on Prisma termination events.
    (this as unknown as { $on: (event: string, cb: () => Promise<void>) => void }).$on(
      'beforeExit',
      async () => {
        await app.close();
      },
    );
  }
}

