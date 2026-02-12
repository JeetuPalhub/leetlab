import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'testuser@leetlab.com'
    const password = 'Password123!'
    const name = 'Test Verification User'

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        console.log('User already exists')
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'USER'
        }
    })
    console.log('Test user created:', newUser.email)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
