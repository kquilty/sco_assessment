import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from './generated/prisma/client';

import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    getHello(): string {
        return 'Hello World!';
    }

    // handleTestPost(dto: TestPostDto): string {
    //     return `Successfully received session: ${dto.session}`;
    // }

    async getPatients() {
        return this.prisma.patient.findMany({
            include: {
                treatment_plans: {
                    include: {
                        treatment_sessions: true,
                    },
                },
            },
        });
    }

    async getPatientWithSessions() {
        return this.prisma.patient.findUnique({
            where: {
                email: 'jon.doe@example.com',
            },
            include: {
                treatment_plans: {
                    include: {
                        treatment_sessions: true,
                    },
                },
            },
        })
    }

    async getPatientSessions(patientId: number) {

        const patient = await this.prisma.patient.findUnique({
            where: {
                id: patientId,
            },
        });

        if (!patient) {
            throw new NotFoundException(`Patient ${patientId} does not exist`);
        }

        return this.prisma.treatmentPlan.findMany({
            where: {
                patient_id: patientId
            },
        });
    }

    async createTreatmentSession(patientId: number, dto: CreateTreatmentSessionDto) {
        const plan = await this.prisma.treatmentPlan.findFirst({
            where: {
                patient_id: patientId,
            },
        });

        if (!plan) {
            throw new NotFoundException(`No active treatment plan found for patient ${patientId}`);
        }

        return this.prisma.treatmentSession.create({
            data: {
                treatment_plan_id: plan.id,
                session_name: dto.session_name,
                treated_at: new Date(dto.treated_at),
                clinician_id: dto.clinician_id,
                status: dto.status,
                parameters: dto.parameters as Prisma.InputJsonObject,
                notes: dto.notes,
            },
        });
    }

}
