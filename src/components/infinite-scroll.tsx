import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

interface InfiniteScrollProps {
    isManual?: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}

export const InfiniteScroll = ({
    isManual = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: InfiniteScrollProps) => {
    const { targetRef, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: "100px"
    });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage])

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div ref={targetRef} className="h-1" /> 
            {hasNextPage ? (
                isFetchingNextPage || !isManual ? (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="text-muted-foreground size-7 animate-spin"/>
                    </div>
                ) : (
                    <Button
                        variant="secondary"
                        disabled={!hasNextPage}
                        onClick={fetchNextPage}
                    >
                        {"Load more"}
                    </Button>
                )
            ) : (
                <p className="text-xs text-muted-foreground">
                    You have reached the end of the list
                </p>
            )}
        </div>
    )
}