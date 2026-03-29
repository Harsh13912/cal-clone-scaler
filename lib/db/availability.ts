import prisma from '@/lib/prisma'

export async function getAllAvailability() {
    try {
        return await prisma.availability.findMany({
            orderBy: { dayOfWeek: 'asc' },
        })
    } catch (error) {
        console.error("Error fetching availability:", error)
        throw new Error("Failed to fetch availability")
    }
}

export async function createAvailability(data: {
    dayOfWeek: number
    startTime: string
    endTime: string
    timezone: string
}) {
    try {
        return await prisma.availability.create({ data })
    } catch (error) {
        console.error("Error creating availability:", error)
        throw new Error("Failed to create availability")
    }
}

export async function updateAvailability(id: string, data: any) {
    try {
        return await prisma.availability.update({
            where: { id },
            data,
        })
    } catch (error) {
        console.error(`Error updating availability with id ${id}:`, error)
        throw new Error("Failed to update availability")
    }
}

export async function deleteAvailability(id: string) {
    try {
        return await prisma.availability.delete({
            where: { id },
        })
    } catch (error) {
        console.error(`Error deleting availability with id ${id}:`, error)
        throw new Error("Failed to delete availability")
    }
}