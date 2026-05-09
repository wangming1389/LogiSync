import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { getPool, initializeDatabase } from "./index";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    this.logger.log("Connecting PostgreSQL...");

    await this.withRetry(async () => {
      initializeDatabase();
      const pool = getPool();
      if (!pool) {
        throw new Error("Database pool is not initialized");
      }
      await pool.query("select 1");
    }, 5, 1500);

    this.logger.log("PostgreSQL connection verified.");
  }

  async onModuleDestroy() {
    const pool = getPool();
    if (!pool) {
      return;
    }

    this.logger.log("Closing PostgreSQL connection...");
    await pool.end();
    this.logger.log("PostgreSQL connection closed.");
  }

  async ping() {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not initialized");
    }

    await pool.query("select 1");
  }

  private async withRetry(
    task: () => Promise<void>,
    attempts: number,
    delayMs: number,
  ) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await task();
        return;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `PostgreSQL connection attempt ${attempt}/${attempts} failed.`,
        );

        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    this.logger.error(
      "PostgreSQL connection failed after retries.",
      lastError instanceof Error ? lastError.stack : String(lastError),
    );
    throw lastError;
  }
}
