import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, PoolConfig } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const poolConfig: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      // Connection pool configuration
      max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10), // maximum number of clients in the pool
      min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10), // minimum number of clients in the pool
      idleTimeoutMillis: parseInt(
        process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000',
        10,
      ), // how long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: parseInt(
        process.env.DATABASE_POOL_CONNECTION_TIMEOUT || '5000',
        10,
      ), // how long to wait for a connection
      maxUses: parseInt(process.env.DATABASE_POOL_MAX_USES || '7500', 10), // maximum number of times a connection can be used before being discarded
    };
    const pool = new Pool(poolConfig);
    super({ adapter: new PrismaPg(pool) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    // Prisma v7+ types no longer include beforeExit typing by default.
    // We still want graceful Nest shutdown on Prisma termination events.
    (
      this as unknown as {
        $on: (event: string, cb: () => Promise<void>) => void;
      }
    ).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
