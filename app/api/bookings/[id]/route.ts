import { NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/db/bookings';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        const canceledBooking = await cancelBooking(id);

        return NextResponse.json(canceledBooking);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}