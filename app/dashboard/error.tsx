'use client'; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service if you had one
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[500px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center animate-in fade-in-50">
            <div className="rounded-full bg-red-50 p-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Something went wrong!</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-[500px]">
                    {error.message || "An unexpected error occurred while loading this dashboard page."}
                </p>
            </div>
            <Button onClick={() => reset()} variant="outline" className="mt-4">
                Try again
            </Button>
        </div>
    );
}