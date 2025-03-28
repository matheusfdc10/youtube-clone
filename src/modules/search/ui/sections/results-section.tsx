"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultsSectionProps {
    query: string | undefined;
    categoryId: string | undefined;
}

export const ResultsSection = ({
    query,
    categoryId,
}: ResultsSectionProps) => {
    return (
        <Suspense
            key={`${query}-${categoryId}`}
            fallback={<ResultsSectionSkeleton />}
        >
            <ErrorBoundary fallback={<p>Error</p>}>
                <ResultsSectionSuspense query={query} categoryId={categoryId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ResultsSectionSkeleton = () => {
    return (
        <>
            <div className="hidden md:flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_,i) => (
                    <VideoRowCardSkeleton key={i}/>
                ))}
            </div>
        
            <div className="flex flex-col gap-4    p-4 gap-y-10 pt-6 md:hidden">
                {Array.from({ length: 5 }).map((_,i) => (
                    <VideoGridCardSkeleton key={i}/>
                ))}
            </div>
        </>
    )
}

const ResultsSectionSuspense = ({
    query,
    categoryId,
}: ResultsSectionProps) => {
    const isMobile = useIsMobile();

    const [result, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
        { query, categoryId, limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )
    
    return (
        <>
            {isMobile ? (
                <div className="flex flex-col gap-4 gap-y-10">
                    {result.pages
                        .flatMap((page) => page.items)
                        .map((video) => (
                            <VideoGridCard
                                key={video.id}
                                data={video}
                            />
                        ))
                    
                    }
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {result.pages
                        .flatMap((page) => page.items)
                        .map((video) => (
                            <VideoRowCard
                                key={video.id}
                                data={video}
                                size="default"
                            />
                        ))
                    }
                </div>
            )}
            <InfiniteScroll
                fetchNextPage={resultsQuery.fetchNextPage}
                hasNextPage={resultsQuery.hasNextPage}
                isFetchingNextPage={resultsQuery.isFetchingNextPage}
            />
        </>
    )
}