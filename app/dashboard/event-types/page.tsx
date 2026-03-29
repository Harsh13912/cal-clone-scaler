'use client';

import React, { useEffect, useState } from 'react';
import {
    Clock, Copy, ExternalLink, MoreHorizontal, ArrowUp, ArrowDown,
    Search, Plus, Pencil, Code, Trash, AlertCircle, Bold, Italic
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function EventTypesPage() {
    const router = useRouter();
    const [eventTypes, setEventTypes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({});

    // Delete Modal State
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create Modal State
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        slug: '',
        description: '',
        duration: 15
    });

    const fetchEventTypes = async () => {
        try {
            const response = await fetch('/api/event-types');
            if (response.ok) {
                const data = await response.json();
                setEventTypes(data);
                const initialToggles: Record<string, boolean> = {};
                data.forEach((event: any) => {
                    initialToggles[event.id] = true;
                });
                setActiveToggles(initialToggles);
            } else {
                toast.error("Failed to load event types");
            }
        } catch (error) {
            toast.error("Network error while fetching events");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/admin/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    const handleToggle = (id: string, checked: boolean) => {
        setActiveToggles(prev => ({ ...prev, [id]: checked }));
        if (!checked) toast("Event type hidden from public profile.");
    };

    const executeDelete = async () => {
        if (!eventToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/event-types/${eventToDelete}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Event type deleted successfully");
                fetchEventTypes();
            } else {
                toast.error("Failed to delete event type");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        } finally {
            setIsDeleting(false);
            setEventToDelete(null);
        }
    };

    // Auto-generate slug from title
    const handleNewTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setNewEvent(prev => ({
            ...prev,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }));
    };

    // FIXED: Handle Creation and Redirect properly without swallowing errors
    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/event-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Event type created");
                setIsNewModalOpen(false); // Only close modal on success
                // Redirect straight to the edit page of the newly created event
                router.push(`/dashboard/event-types/${data.id}/edit`);
            } else {
                // Properly catch and display backend validation errors (e.g. Zod errors)
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to create event type. Check your inputs.");
            }
        } catch (error) {
            toast.error("Network error while creating event type.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 pb-12 font-sans relative">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[24px] font-bold tracking-tight text-white">Event types</h1>
                    <p className="text-zinc-400 text-[14px] mt-1.5 font-normal">Configure different events for people to book on your calendar.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            type="search"
                            placeholder="Search"
                            className="pl-9 h-9 bg-transparent border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-md transition-colors"
                        />
                    </div>

                    <Button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-white text-black hover:bg-zinc-200 border-0 rounded-md px-4 h-9 font-medium shadow-none transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        New
                    </Button>
                </div>
            </div>

            {/* The List Container */}
            <div className="border border-zinc-800 rounded-lg bg-transparent">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full bg-zinc-800/50 rounded-md" />)}
                    </div>
                ) : eventTypes.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-[14px]">
                        No event types found. Create one to get started.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {eventTypes.map((event, index) => {
                            const isFirst = index === 0;
                            const isLast = index === eventTypes.length - 1;

                            return (
                                <div
                                    key={event.id}
                                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-b-0 ${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg' : ''}`}
                                >

                                    {/* Floating Up/Down Arrows */}
                                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex-col gap-1 hidden xl:group-hover:flex">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-transparent border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 shadow-sm transition-all">
                                            <ArrowUp className="h-[14px] w-[14px]" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-transparent border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 shadow-sm transition-all mt-1">
                                            <ArrowDown className="h-[14px] w-[14px]" />
                                        </Button>
                                    </div>

                                    {/* Left Side: Event Info */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                            <h3 className="font-semibold text-white text-[15px] tracking-tight">{event.title}</h3>
                                            <span className="text-zinc-500 text-[14px] font-normal hidden sm:inline-block">
                                          /admin/{event.slug}
                                        </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Badge variant="secondary" className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 font-medium px-2 py-0.5 rounded-[4px] text-[12px]">
                                                <Clock className="w-[12px] h-[12px] mr-1.5 opacity-70" />
                                                {event.duration}m
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Right Side: Actions */}
                                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                        <div className="flex items-center gap-3">
                                            {!activeToggles[event.id] && (
                                                <span className="text-zinc-500 text-[14px] font-normal tracking-tight">Hidden</span>
                                            )}
                                            <Switch
                                                checked={activeToggles[event.id] ?? true}
                                                onCheckedChange={(c) => handleToggle(event.id, c)}
                                                className="data-[state=checked]:!bg-white data-[state=unchecked]:!bg-zinc-800 border-0 [&_span]:data-[state=checked]:!bg-black [&_span]:data-[state=unchecked]:!bg-zinc-400 focus-visible:ring-zinc-700"
                                            />
                                        </div>

                                        <div className="flex items-center border border-zinc-800 rounded-md bg-transparent h-9 overflow-visible">
                                            <Button variant="ghost" size="icon" onClick={() => window.open(`/admin/${event.slug}`, '_blank')} className="h-full px-3.5 rounded-none border-r border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                                                <ExternalLink className="h-[15px] w-[15px]" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => copyLink(event.slug)} className="h-full px-3.5 rounded-none border-r border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                                                <Copy className="h-[15px] w-[15px]" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-full px-3.5 rounded-none text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0">
                                                        <MoreHorizontal className="h-[15px] w-[15px]" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-zinc-800 p-1 shadow-xl rounded-xl">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/event-types/${event.id}/edit`)} className="text-zinc-300 hover:!bg-zinc-800 hover:!text-white focus:!bg-zinc-800 focus:!text-white cursor-pointer rounded-md my-0.5">
                                                        <Pencil className="mr-2.5 h-4 w-4 text-zinc-400" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast("Duplicate feature coming soon!")} className="text-zinc-300 hover:!bg-zinc-800 hover:!text-white focus:!bg-zinc-800 focus:!text-white cursor-pointer rounded-md my-0.5">
                                                        <Copy className="mr-2.5 h-4 w-4 text-zinc-400" />
                                                        <span>Duplicate</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast("Embed code copied to clipboard!")} className="text-zinc-300 hover:!bg-zinc-800 hover:!text-white focus:!bg-zinc-800 focus:!text-white cursor-pointer rounded-md my-0.5">
                                                        <Code className="mr-2.5 h-4 w-4 text-zinc-400" />
                                                        <span>Embed</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                                                    <DropdownMenuItem onClick={() => setEventToDelete(event.id)} className="text-[#f87171] hover:!bg-red-500/10 hover:!text-red-400 focus:!bg-red-500/10 focus:!text-red-400 cursor-pointer rounded-md my-0.5">
                                                        <Trash className="mr-2.5 h-4 w-4 text-[#f87171]" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                </div>
                            )})}
                    </div>
                )}
            </div>

            {/* Global Delete Confirmation Dialog */}
            <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <DialogContent className="bg-[#1c1c1c] border-zinc-800 text-white sm:max-w-[450px] p-0 shadow-2xl rounded-2xl overflow-hidden gap-0">
                    <div className="p-6">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3f1919] flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-[20px] font-bold tracking-tight">Delete event type?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-zinc-400 mt-4 text-[15px] leading-relaxed text-left">
                            Anyone who you've shared this link with will no longer be able to book using it.
                        </DialogDescription>
                    </div>
                    <div className="bg-[#242424] px-6 py-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                        <Button variant="ghost" onClick={() => setEventToDelete(null)} className="text-zinc-300 hover:text-white hover:bg-zinc-700 font-medium">Cancel</Button>
                        <Button variant="destructive" onClick={executeDelete} disabled={isDeleting} className="bg-white text-black hover:bg-zinc-200 font-medium border-0">
                            {isDeleting ? "Deleting..." : "Delete event type"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Event Type Modal */}
            <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
                <DialogContent className="bg-[#1c1c1c] border-zinc-800 text-white sm:max-w-[500px] p-0 shadow-2xl rounded-2xl overflow-hidden gap-0">

                    <div className="p-6 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-[20px] font-bold tracking-tight text-left">Add a new event type</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-[14px] text-left mt-1.5">
                                Set up event types to offer different types of meetings.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 mt-6 text-left">

                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[14px] font-semibold text-white">Title</label>
                                <Input
                                    value={newEvent.title}
                                    onChange={handleNewTitleChange}
                                    placeholder="Quick chat"
                                    className="bg-transparent border-zinc-700 text-white h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-600 text-[15px]"
                                />
                            </div>

                            {/* URL */}
                            <div className="space-y-1.5">
                                <label className="text-[14px] font-semibold text-white">URL</label>
                                <div className="flex rounded-lg overflow-hidden border border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-600 bg-transparent">
                                    <div className="px-3 py-2 text-zinc-500 text-[14px] flex items-center whitespace-nowrap select-none bg-zinc-800/40">
                                        cal.com/admin/
                                    </div>
                                    <Input
                                        value={newEvent.slug}
                                        onChange={(e) => setNewEvent({...newEvent, slug: e.target.value})}
                                        className="border-0 rounded-none bg-transparent text-white focus-visible:ring-0 px-2 h-10 text-[15px]"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[14px] font-semibold text-white">Description</label>
                                <div className="border border-zinc-700 rounded-lg overflow-hidden bg-transparent focus-within:ring-1 focus-within:ring-zinc-600">
                                    <div className="flex items-center gap-3 border-b border-zinc-700 bg-transparent px-3 py-2 text-zinc-400">
                                        <Bold className="h-3.5 w-3.5 hover:text-white cursor-pointer" />
                                        <Italic className="h-3.5 w-3.5 hover:text-white cursor-pointer" />
                                    </div>
                                    <Textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                        placeholder="A quick video meeting."
                                        className="border-0 focus-visible:ring-0 resize-none min-h-[80px] bg-transparent text-white placeholder:text-zinc-600 rounded-none p-3 text-[14px]"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-1.5 pb-2">
                                <label className="text-[14px] font-semibold text-white">Duration</label>
                                <div className="relative w-full">
                                    <Input
                                        type="number"
                                        value={newEvent.duration}
                                        onChange={(e) => setNewEvent({...newEvent, duration: Number(e.target.value)})}
                                        className="w-full bg-transparent border-zinc-700 text-white text-[15px] rounded-lg pl-3 pr-20 h-10 focus-visible:ring-1 focus-visible:ring-zinc-600"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-400 text-[14px]">
                                        minutes
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="bg-[#242424] px-6 py-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                        <Button variant="ghost" onClick={() => setIsNewModalOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-700 font-medium">Close</Button>
                        <Button onClick={handleCreate} disabled={isCreating || !newEvent.title} className="bg-white text-black hover:bg-zinc-200 font-medium border-0 px-5">
                            {isCreating ? "Saving..." : "Continue"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}