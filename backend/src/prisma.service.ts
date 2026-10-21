import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(private configService: ConfigService) {
        const adapter = new PrismaMariaDb({
            host: configService.getOrThrow<string>('DB_HOST'),
            port: Number(configService.getOrThrow<string>('DB_PORT')),
            user: configService.getOrThrow<string>('DB_USER'),
            password: configService.getOrThrow<string>('DB_PASSWORD'),
            database: configService.getOrThrow<string>('DB_NAME'),
            connectionLimit: 5,
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}