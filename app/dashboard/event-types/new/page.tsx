import { EventTypeForm } from "@/components/event-type-form";

export default function NewEventTypePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create New Event Type</h1>
                <p className="text-muted-foreground text-sm">Define a new set of rules for your bookings.</p>
            </div>
            <EventTypeForm mode="create" />
        </div>
    );
}