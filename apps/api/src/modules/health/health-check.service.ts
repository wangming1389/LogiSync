import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { SessionRegistryService } from "../session/session-registry.service";

export interface HealthStatus {
  database: boolean;
  redis: boolean;
  fileStorage: boolean;
  timestamp: number;
}

@Injectable()
export class HealthCheckService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly checkIntervalMs = 15 * 1000;
  private timer?: NodeJS.Timeout;
  private status: HealthStatus = {
    database: false,
    redis: false,
    fileStorage: true,
    timestamp: Date.now(),
  };

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly sessionRegistryService: SessionRegistryService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.performHealthCheck();
    }, this.checkIntervalMs);
    this.timer.unref();
    void this.performHealthCheck();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async performHealthCheck() {
    try {
      await this.databaseService.ping();
      this.status.database = true;
    } catch (error) {
      this.status.database = false;
      this.logger.error(
        "Database health check failed",
        error instanceof Error ? error.stack : String(error),
      );
    }

    try {
      await this.sessionRegistryService.ping();
      this.status.redis = true;
    } catch (error) {
      this.status.redis = false;
      this.logger.error(
        "Redis health check failed",
        error instanceof Error ? error.stack : String(error),
      );
    }

    this.status.fileStorage = true;
    this.status.timestamp = Date.now();

    if (!this.isHealthy()) {
      this.logger.warn(
        "Health check degraded. Monitoring agent should alert admins immediately.",
      );
    }

    return this.getStatus();
  }

  getStatus(): HealthStatus {
    return { ...this.status };
  }

  isHealthy(): boolean {
    return this.status.database && this.status.redis && this.status.fileStorage;
  }
}
