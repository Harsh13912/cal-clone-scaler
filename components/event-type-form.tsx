'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 1. We use z.coerce.number() to automatically turn the string values from
// the HTML Select components into actual numbers for the database.
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric with hyphens"),
    description: z.string().optional(),
    duration: z.coerce.number().min(1, "Duration is required"),
    bufferTime: z.coerce.number().default(0),
});

export function EventTypeForm({ initialData, mode }: { initialData?: any; mode: 'create' | 'edit' }) {
    const router = useRouter();

    // 2. We remove the strict <z.infer<typeof formSchema>> generic here.
    // This allows React Hook Form to accept the initial string values from the UI
    // while the zodResolver handles the conversion to numbers for the final submission.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            // Ensure these are passed as strings to the Select components
            duration: initialData?.duration?.toString() || "30",
            bufferTime: initialData?.bufferTime?.toString() || "0",
        },
    });

    // 3. We explicitly type the 'values' here to maintain full
    // TypeScript safety for our API call.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const url = mode === 'create' ? '/api/event-types' : `/api/event-types/${initialData.id}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success(mode === 'create' ? "Event type created" : "Event type updated");
                router.push('/dashboard/event-types');
                router.refresh();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to save event type");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="e.g. 15 Minute Meeting" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl><Input placeholder="e.g. 15-min" {...field} /></FormControl>
                        <FormDescription>This will be at your-domain.com/admin/slug</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="What is this meeting about?" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {[15, 30, 45, 60].map((m) => <SelectItem key={m} value={m.toString()}>{m}m</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="bufferTime" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Buffer Time (minutes)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select buffer" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {[0, 5, 10, 15].map((m) => <SelectItem key={m} value={m.toString()}>{m}m</SelectItem>)}\r\n
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">{mode === 'create' ? 'Create Event Type' : 'Update Event Type'}</Button>
                </div>
            </form>
        </Form>
    );
}