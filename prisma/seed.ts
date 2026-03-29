import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Clearing old data...')
    await prisma.booking.deleteMany()
    await prisma.dateOverride.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.eventType.deleteMany()

    console.log('Seeding Event Types...')
    const meeting30 = await prisma.eventType.create({
        data: {
            title: '30 Minute Meeting',
            slug: '30min',
            description: 'A standard 30-minute meeting to discuss your needs.',
            duration: 30,
            bufferTime: 5,
        },
    })

    const quickCall = await prisma.eventType.create({
        data: {
            title: 'Quick Call',
            slug: 'quick-call',
            description: 'A quick 15-minute sync.',
            duration: 15,
            bufferTime: 5,
        },
    })

    const consultation = await prisma.eventType.create({
        data: {
            title: 'Consultation',
            slug: 'consultation',
            description: 'A deep-dive 60-minute consultation.',
            duration: 60,
            bufferTime: 5,
        },
    })

    console.log('Seeding Availability...')
    const days = [1, 2, 3, 4, 5] // Monday (1) to Friday (5)
    for (const day of days) {
        await prisma.availability.create({
            data: {
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '17:00',
                timezone: 'Asia/Kolkata',
            },
        })
    }

    console.log('Seeding Date Overrides...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(0, 0, 0, 0)

    await prisma.dateOverride.create({
        data: {
            date: tomorrow,
            isBlocked: true,
        },
    })

    await prisma.dateOverride.create({
        data: {
            date: dayAfterTomorrow,
            isBlocked: false,
            customStartTime: '10:00',
            customEndTime: '14:00',
        },
    })

    console.log('Seeding Bookings...')
    const today = new Date()

    // Upcoming booking (tomorrow 2 PM)
    const tomorrow2PM = new Date(tomorrow)
    tomorrow2PM.setHours(14, 0, 0, 0)

    // Upcoming booking (in 3 days 10 AM)
    const in3Days10AM = new Date()
    in3Days10AM.setDate(today.getDate() + 3)
    in3Days10AM.setHours(10, 0, 0, 0)

    // Past booking (yesterday 3 PM)
    const yesterday3PM = new Date()
    yesterday3PM.setDate(today.getDate() - 1)
    yesterday3PM.setHours(15, 0, 0, 0)

    await prisma.booking.create({
        data: {
            eventTypeId: meeting30.id,
            bookerName: 'Alice Smith',
            bookerEmail: 'alice@example.com',
            startTime: tomorrow2PM,
            endTime: new Date(tomorrow2PM.getTime() + 30 * 60000),
            status: 'confirmed',
        },
    })

    await prisma.booking.create({
        data: {
            eventTypeId: quickCall.id,
            bookerName: 'Bob Johnson',
            bookerEmail: 'bob@example.com',
            startTime: in3Days10AM,
            endTime: new Date(in3Days10AM.getTime() + 15 * 60000),
            status: 'confirmed',
        },
    })

    await prisma.booking.create({
        data: {
            eventTypeId: consultation.id,
            bookerName: 'Charlie Brown',
            bookerEmail: 'charlie@example.com',
            startTime: yesterday3PM,
            endTime: new Date(yesterday3PM.getTime() + 60 * 60000),
            status: 'confirmed',
        },
    })

    console.log('Database seeded successfully! 🌱')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })