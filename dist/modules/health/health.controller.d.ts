import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    check(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    };
    readiness(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: boolean;
        };
    }>;
}
