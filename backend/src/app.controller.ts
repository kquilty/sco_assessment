import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    // @Post('test-post')
    // testPost(@Body() testPostDto: TestPostDto): string {
    //     return this.appService.handleTestPost(testPostDto);
    // }

    @Get('patients')
    async getPatients() {
        return this.appService.getPatients();
    }
    
    @Get('patient-with-sessions')
    async getPatientWithSessions() {
        return this.appService.getPatientWithSessions();
    }

    @Get('/patients/:id/sessions')
    async getPatientSessions(@Param('id', ParseIntPipe) id: number) {
        return this.appService.getPatientSessions(id);
    }

    @Post('/patients/:id/sessions')
    async createTreatmentSession(
        @Param('id', ParseIntPipe) id: number,
        @Body() createTreatmentSessionDto: CreateTreatmentSessionDto
    ) {
        return this.appService.createTreatmentSession(id, createTreatmentSessionDto);
    }
}
