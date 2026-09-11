import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'starter_db',
})

const prisma = new PrismaClient({ adapter })

async function main() {

    let patient

    // JON
    patient = await prisma.patient.upsert({
        where: {
            email: 'jon.doe@example.com',
        },

        update: {},

        create: {
            email: 'jon.doe@example.com',
            name: 'Jon Doe',
            treatment_plans: {
                create: [
                    { plan_name: 'Jon\'s first treatment plan' },
                    { plan_name: 'Jon\'s second treatment plan' },
                ],
            },
        },
    })

    const treatmentPlan = await prisma.treatmentPlan.findFirst({
        where: {
            patient_id: patient.id,
        },
    })

    if (!treatmentPlan) {
        throw new Error('Expected at least one treatment plan for seeded patient')
    }

    await prisma.treatmentSession.createMany({
        data: [
            {
                session_name: 'Jon\'s first treatment session',
                treatment_plan_id: treatmentPlan.id,
                treated_at: new Date(),
                clinician_id: 'clinician_1',
                status: 'SCHEDULED',
                parameters: {},
            },
            {
                session_name: 'Jon\'s second treatment session',
                treatment_plan_id: treatmentPlan.id,
                treated_at: new Date(),
                clinician_id: 'clinician_1',
                status: 'SCHEDULED',
                parameters: {},
            },
        ],
    })
    console.log('Created patient: ' + patient.name)


    

    // JANE
    patient = await prisma.patient.upsert({
        where: {
            email: 'jane.doe@example.com',
        },

        update: {},

        create: {
            email: 'jane.doe@example.com',
            name: 'Jane Doe',
            treatment_plans: {
                create: [
                    { plan_name: 'Jane\'s first treatment plan' },
                    { plan_name: 'Jane\'s second treatment plan' },
                ],
            },
        },
    })

    const janeTreatmentPlan = await prisma.treatmentPlan.findFirst({
        where: {
            patient_id: patient.id,
        },
    })

    if (!janeTreatmentPlan) {
        throw new Error('Expected at least one treatment plan for seeded patient Jane')
    }

    await prisma.treatmentSession.createMany({
        data: [
            {
                session_name: 'Jane\'s first treatment session',
                treatment_plan_id: janeTreatmentPlan.id,
                clinician_id: 'clinician_1',
                status: 'SCHEDULED',
                treated_at: new Date(),
                parameters: {},
            },
            {
                session_name: 'Jane\'s second treatment session',
                treatment_plan_id: janeTreatmentPlan.id,
                clinician_id: 'clinician_1',
                status: 'SCHEDULED',
                treated_at: new Date(),
                parameters: {},
            },
        ],
    })
    console.log('Created patient: ' + patient.name)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
