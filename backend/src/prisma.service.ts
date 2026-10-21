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

            // !!! LOCAL DEV ONLY !!!
            // MySQL 8.4 uses caching_sha2_password, which needs the server's RSA key 
            // to send the password over an unencrypted connection.
            // Production should use TLS instead of fetching the key at runtime.
            allowPublicKeyRetrieval: true,
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}