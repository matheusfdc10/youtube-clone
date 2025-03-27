"use client"

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard, VideoRowCardSkeleton } from "../components/video-row-card";
import { VideoGridCard, VideoGridCardSkeleton } from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SuggestionsSectionProps {
    videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
    return (
        <Suspense fallback={<SuggestionsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SuggestionsSectionSuspense videoId={videoId}/>
            </ErrorBoundary>
        </Suspense>
    )
}

const SuggestionsSectionSkeleton = () => {
    return (
        <>
            <div className="hidden md:block space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <VideoRowCardSkeleton
                        key={i}
                        size="compact"
                    />
                ))}
            </div>
            <div className="block md:hidden space-y-10">
                {Array.from({ length: 5 }).map((_, i) => (
                    <VideoGridCardSkeleton
                        key={i}
                    />
                ))}
            </div>
        </>
    )
}

const SuggestionsSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
    const [suggestions, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({
        videoId,
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
        const onChange = () => {
            setIsSmall(window.innerWidth < 1280);
        };

        window.addEventListener("resize", onChange);
        return () => window.removeEventListener("resize", onChange);
    }, []);

    return (
        <>
            <div className="hidden md:block space-y-3">
                {suggestions.pages.flatMap((page) => page.items).map((video) => (
                    <VideoRowCard
                        key={video.id}
                        data={video}
                        onRemove={() => {}}
                        size="compact"
                    />
                ))}
            </div>
            <div className="block md:hidden space-y-10">
                {suggestions.pages.flatMap((page) => page.items).map((video) => (
                    <VideoGridCard
                        key={video.id}
                        data={video}
                        onRemove={() => {}}
                    />
                ))}
            </div>
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
                isManual={isSmall}
            />
        </>
    )
}