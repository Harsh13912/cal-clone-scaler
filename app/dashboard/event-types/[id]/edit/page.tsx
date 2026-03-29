'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Link2, Code, Trash, Video, Clock,
    Settings, Infinity, Zap, Webhook, AlignLeft, Bold, Italic,
    ArrowDown, AlertCircle, ExternalLink, ChevronRight, Grid, Users, BarChart, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EditEventTypePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        duration: 30,
        bufferTime: 0,
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/event-types/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        description: data.description || '',
                        duration: data.duration,
                        bufferTime: data.bufferTime || 0,
                    });
                } else {
                    toast.error("Failed to load event type");
                    router.push('/dashboard/event-types');
                }
            } catch (error) {
                toast.error("An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, router]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug) {
            toast.error("Title and URL slug are required.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/event-types/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    duration: Number(formData.duration),
                    bufferTime: Number(formData.bufferTime),
                }),
            });

            if (response.ok) {
                toast.success("Event type updated successfully");
                router.push('/dashboard/event-types');
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to update event type");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/event-types/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Event deleted");
                router.push('/dashboard/event-types');
            } else {
                toast.error("Failed to delete event");
            }
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/admin/${formData.slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    if (isLoading) {
        return <div className="p-8 bg-[#111111] min-h-screen"><Skeleton className="h-12 w-1/3 bg-zinc-800 mb-8" /><Skeleton className="h-64 w-full bg-zinc-800" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans pb-20">

            <div className="max-w-[1050px] mx-auto pt-6 px-4 sm:px-6 lg:px-8">

                {/* Top Action Bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/event-types')} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-[18px] font-semibold text-white tracking-tight">{formData.title || 'Untitled Event'}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-zinc-400 text-[14px]">Hidden</span>
                            <Switch
                                checked={isHidden} onCheckedChange={setIsHidden}
                                className="data-[state=checked]:!bg-white data-[state=unchecked]:!bg-zinc-800 border-0 [&_span]:data-[state=checked]:!bg-black [&_span]:data-[state=unchecked]:!bg-zinc-400"
                            />
                        </div>

                        <div className="h-4 w-px bg-zinc-800 hidden sm:block mx-1"></div>

                        <TooltipProvider delayDuration={0}>
                            <div className="flex items-center border border-zinc-800 rounded-md bg-transparent h-[34px] overflow-visible">

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => window.open(`/admin/${formData.slug}`, '_blank')} className="h-full w-10 rounded-none border-r border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                                            <ExternalLink className="h-[15px] w-[15px]" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-white text-black font-semibold border-0 px-3 py-1.5 text-[13px] rounded-md shadow-md mt-1">Preview</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={copyLink} className="h-full w-10 rounded-none border-r border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                                            <Link2 className="h-[15px] w-[15px]" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-white text-black font-semibold border-0 px-3 py-1.5 text-[13px] rounded-md shadow-md mt-1">Copy link to event</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => toast("Embed code feature coming soon!")} className="h-full w-10 rounded-none border-r border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                                            <Code className="h-[15px] w-[15px]" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-white text-black font-semibold border-0 px-3 py-1.5 text-[13px] rounded-md shadow-md mt-1">Embed</TooltipContent>
                                </Tooltip>

                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-full w-10 rounded-none text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
                                                    <Trash className="h-[15px] w-[15px]" />
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-white text-black font-semibold border-0 px-3 py-1.5 text-[13px] rounded-md shadow-md mt-1">Delete</TooltipContent>
                                    </Tooltip>

                                    <DialogContent className="bg-[#1c1c1c] border-zinc-800 text-white sm:max-w-[450px] p-0 shadow-2xl rounded-2xl overflow-hidden gap-0 [&>button]:text-zinc-400 [&>button]:hover:text-white">
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
                                            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-zinc-300 hover:text-white hover:bg-zinc-700 font-medium">Cancel</Button>
                                            <Button variant="destructive" onClick={executeDelete} disabled={isDeleting} className="bg-white text-black hover:bg-zinc-200 font-medium border-0">
                                                {isDeleting ? "Deleting..." : "Delete event type"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                            </div>
                        </TooltipProvider>

                        <div className="h-4 w-px bg-zinc-800 hidden sm:block mx-1"></div>

                        <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200 border-0 font-medium px-5 h-[34px] text-[14px] shadow-none rounded-md">
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-10">

                    {/* Left Sidebar Navigation */}
                    <div className="w-full md:w-[240px] flex-shrink-0 space-y-1">

                        {/* Active Item */}
                        <button className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg bg-zinc-800/80 text-white transition-colors">
                            <div className="flex items-start">
                                <Link2 className="h-[18px] w-[18px] mr-3 mt-0.5 text-zinc-300" />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-medium leading-tight">Basics</span>
                                    <span className="text-[13px] text-zinc-400 mt-1 leading-tight">{formData.duration} mins</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                        </button>

                        {/* Inactive Items */}
                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors">
                            <Clock className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Availability</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">Working hours</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors">
                            <Clock className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Limits</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">How often you can be booked</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors">
                            <Settings className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Advanced</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">Calendar settings & more...</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors mt-2">
                            <Infinity className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Recurring</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">Set up a repeating schedule</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors mt-2">
                            <Grid className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Apps</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">0 apps, 0 active</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors">
                            <Zap className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Workflows</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">0 active</span>
                            </div>
                        </button>

                        <button className="w-full flex items-start text-left px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors">
                            <Webhook className="h-[18px] w-[18px] mr-3 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium leading-tight">Webhooks</span>
                                <span className="text-[13px] text-zinc-500 mt-1 leading-tight">0 active</span>
                            </div>
                        </button>

                    </div>

                    {/* Main Form Content */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Card 1: Basics */}
                        <div className="border border-zinc-800 rounded-xl p-6 bg-transparent">
                            <div className="space-y-6">

                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-[14px] font-semibold text-white">Title</label>
                                    <Input
                                        value={formData.title} onChange={handleTitleChange}
                                        className="bg-transparent border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 h-10 rounded-lg text-[15px]"
                                    />
                                </div>

                                {/* Description Input */}
                                <div className="space-y-2">
                                    <label className="text-[14px] font-semibold text-white">Description</label>
                                    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-transparent focus-within:ring-1 focus-within:ring-zinc-700">
                                        <div className="flex items-center gap-3 border-b border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-400">
                                            <span className="text-[13px] font-medium flex items-center gap-1 hover:text-white cursor-pointer">Normal <ArrowDown className="h-3 w-3 ml-0.5" /></span>
                                            <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                                            <Bold className="h-4 w-4 hover:text-white cursor-pointer" />
                                            <Italic className="h-4 w-4 hover:text-white cursor-pointer" />
                                            <Link2 className="h-4 w-4 hover:text-white cursor-pointer" />
                                        </div>
                                        <Textarea
                                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="A quick video meeting."
                                            className="border-0 focus-visible:ring-0 resize-none min-h-[120px] bg-transparent text-white placeholder:text-zinc-600 rounded-none p-4 text-[15px]"
                                        />
                                    </div>
                                </div>

                                {/* URL Slug Input */}
                                <div className="space-y-2">
                                    <label className="text-[14px] font-semibold text-white">URL</label>
                                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 focus-within:ring-1 focus-within:ring-zinc-700 bg-transparent">
                                        <div className="px-4 py-2.5 text-zinc-500 text-[15px] flex items-center whitespace-nowrap select-none">
                                            cal.com/admin/
                                        </div>
                                        <Input
                                            value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                            className="border-0 rounded-none bg-transparent text-white focus-visible:ring-0 px-0 h-auto text-[15px]"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Card 2: Duration */}
                        <div className="border border-zinc-800 rounded-xl p-6 bg-transparent">
                            <div className="space-y-5">
                                <label className="text-[14px] font-semibold text-white">Duration</label>
                                <div className="relative w-full">
                                    <Input
                                        type="number"
                                        value={formData.duration} onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                                        className="w-full bg-transparent border-zinc-800 text-white text-[15px] rounded-lg pl-4 pr-16 py-2.5 h-10 focus-visible:ring-1 focus-visible:ring-zinc-700"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500 text-[14px]">
                                        Minutes
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Switch className="data-[state=checked]:!bg-white data-[state=unchecked]:!bg-zinc-800 border-0 [&_span]:data-[state=checked]:!bg-black [&_span]:data-[state=unchecked]:!bg-zinc-400" />
                                    <span className="text-[14px] text-zinc-400 font-medium">Allow multiple durations</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Location */}
                        <div className="border border-zinc-800 rounded-xl p-6 bg-transparent mb-12">
                            <div className="space-y-4">
                                <label className="text-[14px] font-semibold text-white">Location</label>
                                <div className="relative w-full">
                                    <select className="w-full appearance-none bg-transparent border border-zinc-800 text-white text-[15px] rounded-lg pl-10 pr-8 py-2.5 h-10 outline-none focus:ring-1 focus:ring-zinc-700">
                                        <option>Cal Video (Default)</option>
                                        <option>In-person Meeting</option>
                                        <option>Phone Call</option>
                                    </select>
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                        <Video className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                                        <ArrowDown className="h-4 w-4 text-zinc-500" />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-4">
                                    <p className="text-[14px] text-zinc-400 cursor-pointer hover:text-white transition-colors">Show advanced settings</p>
                                    <p className="text-[14px] text-zinc-400 cursor-pointer hover:text-white transition-colors flex items-center"><Plus className="h-4 w-4 mr-1.5" /> Add a location</p>
                                    <p className="text-[14px] text-zinc-500">Can't find the right conferencing app? Visit our <span className="text-blue-400 hover:underline cursor-pointer">App Store</span>.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}