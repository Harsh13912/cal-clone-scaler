import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardFooter } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="group transition-colors">
                        <CardHeader className="space-y-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <Skeleton className="h-4 w-4/5" />
                        </CardHeader>
                        <CardFooter className="flex justify-between border-t bg-gray-50/50 pt-4">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}