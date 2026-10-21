import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config'; 

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // "Allow every other module to access the config without needing to import it themselves"
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
