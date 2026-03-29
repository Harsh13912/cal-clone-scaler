'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface TimeSlot {
    startTime: string;
    endTime: string;
    display: string;
}

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
});

export function BookingClient({ eventType }: { eventType: any }) {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    // New States for the Form Phase
    const [isBookingMode, setIsBookingMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "" },
    });

    const disabledDays = {
        before: new Date(new Date().setHours(0, 0, 0, 0)),
        after: new Date(new Date().setDate(new Date().getDate() + 60))
    };

    useEffect(() => {
        if (!date) return;
        const fetchSlots = async () => {
            setIsLoading(true);
            setSelectedSlot(null);
            setIsBookingMode(false);

            try {
                const formattedDate = format(date, 'yyyy-MM-dd');
                const response = await fetch(`/api/event-types/${eventType.slug}/available-slots?date=${formattedDate}`);
                if (response.ok) {
                    setAvailableSlots(await response.json());
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                setAvailableSlots([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSlots();
    }, [date, eventType.slug]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedSlot) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventTypeId: eventType.id,
                    bookerName: values.name,
                    bookerEmail: values.email,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                })
            });

            if (response.ok) {
                const booking = await response.json();
                // Redirect to the Confirmation Page (We will build this in Step 7.3!)
                router.push(`/admin/${eventType.slug}/confirmed?bookingId=${booking.id}`);
            } else if (response.status === 409) {
                toast.error("This time slot was just booked by someone else! Please select another.");
                setIsBookingMode(false);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to connect to the server.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Left Side - Calendar (Hidden on mobile if in form mode) */}
            <div className={`p-6 md:w-1/2 flex justify-center border-b md:border-b-0 md:border-r border-gray-100 ${isBookingMode ? 'hidden md:flex' : 'flex'}`}>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={disabledDays}
                    className="rounded-md"
                />
            </div>

            {/* Right Side - Dynamic Content Area */}
            <div className="p-6 md:w-1/2 bg-gray-50/50 flex flex-col h-full w-full">

                {/* VIEW 1: Time Slots Grid */}
                {!isBookingMode ? (
                    <>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">
                            {date ? format(date, 'EEEE, MMMM d') : 'Select a date'}
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {!date ? (
                                <p className="text-gray-500">Select a date to see available times.</p>
                            ) : isLoading ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="p-4 text-center border rounded-md bg-white border-dashed">
                                    <p className="text-gray-500">No available times on this date.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map((slot, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                                            className="w-full transition-all"
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {slot.display}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedSlot && (
                            <div className="mt-6 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                                <Button className="w-full shadow-md" size="lg" onClick={() => setIsBookingMode(true)}>
                                    Next: Confirm Details
                                </Button>
                            </div>
                        )}
                    </>
                ) : (

                    /* VIEW 2: The Booking Form */
                    <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="flex items-center mb-6">
                            <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={() => setIsBookingMode(false)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="font-semibold text-lg text-gray-900">Enter Details</h3>
                        </div>

                        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
                            <p className="text-sm text-gray-500 font-medium mb-1">Selected Time:</p>
                            <p className="text-base text-gray-900 font-semibold">
                                {date && format(date, 'EEEE, MMMM d')} at {selectedSlot?.display}
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 mt-auto">
                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? "Confirming..." : "Confirm Booking"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
}