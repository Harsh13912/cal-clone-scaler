import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-8">
                        <Skeleton className="h-8 w-64" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-10 flex-1 max-w-sm" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}