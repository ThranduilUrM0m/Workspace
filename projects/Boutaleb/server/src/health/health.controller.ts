import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

// 200 when the API and Mongo answer, 503 otherwise. Coolify and the uptime
// monitor (T13.7) read this.
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly mongo: MongooseHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([() => this.mongo.pingCheck('mongo', { timeout: 1500 })]);
    }
}
