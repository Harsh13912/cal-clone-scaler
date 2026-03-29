import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { CheckCircle, CalendarDays, Clock, User, Mail, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ConfirmedPage({
                                                params,
                                                searchParams
                                            }: {
    params: Promise<{ username: string, slug: string }>,
    searchParams: Promise<{ bookingId?: string }>
}) {
    // Await params and searchParams for Next.js 15 compatibility
    const { username, slug } = await params;
    const { bookingId } = await searchParams;

    if (!bookingId) {
        notFound();
    }

    // Fetch the booking and include the related EventType data
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { eventType: true }
    });

    if (!booking) {
        notFound();
    }

    // Generate Google Calendar URL
    // Format requires: YYYYMMDDTHHmmssZ
    const formatForGCal = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gCalStart = formatForGCal(booking.startTime);
    const gCalEnd = formatForGCal(booking.endTime);
    const gCalDetails = encodeURIComponent(`Meeting with ${booking.bookerName}\n\n${booking.eventType.description || ""}`);
    const gCalTitle = encodeURIComponent(`${booking.eventType.title} with ${username}`);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gCalTitle}&dates=${gCalStart}/${gCalEnd}&details=${gCalDetails}`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <Card className="max-w-xl w-full mx-auto p-8 border-0 shadow-lg ring-1 ring-gray-200 text-center animate-in zoom-in-95 duration-300">

                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8">We have emailed your calendar invitation.</p>

                <div className="bg-gray-50 rounded-lg p-6 text-left mb-8 border border-gray-100 space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-4 mb-4">{booking.eventType.title}</h2>

                    <div className="flex items-start text-gray-600">
                        <CalendarDays className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <span>{format(booking.startTime, 'EEEE, MMMM d, yyyy')}</span>
                    </div>

                    <div className="flex items-start text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <span>
              {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
            </span>
                    </div>

                    <div className="flex items-start text-gray-600">
                        <User className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <span>{booking.bookerName}</span>
                    </div>

                    <div className="flex items-start text-gray-600">
                        <Mail className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <span>{booking.bookerEmail}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                        <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                            Add to Google Calendar
                        </a>
                    </Button>

                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/admin/${slug}`}>
                            Book Another Meeting
                        </Link>
                    </Button>
                </div>

            </Card>
        </div>
    );
}