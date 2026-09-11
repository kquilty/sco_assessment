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
    console.log("TODO")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
