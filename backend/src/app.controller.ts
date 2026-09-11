import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { GetTestConnectionDto } from './dto/get-test-connection.dto';
import { TestPostDto } from './dto/test-post.dto';
import { CreatePatientSession } from './dto/create-patient-session.dto';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }


}
