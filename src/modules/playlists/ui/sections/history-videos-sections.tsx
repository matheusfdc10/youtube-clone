"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const HistoryVideosSection = () => {
    return (
        <Suspense fallback={<HistoryVideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <HistoryVideosSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const HistoryVideosSectionSkeleton = () => {
    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {Array.from({ length: DEFAULT_LIMIT }).map((_,i) => (
                    <VideoGridCardSkeleton key={i} />
                ))}
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {Array.from({ length: DEFAULT_LIMIT }).map((_,i) => (
                    <VideoRowCardSkeleton key={i} size="compact"/>
                ))}
            </div>
        </>
    )
}

const HistoryVideosSectionSuspense = () => {
    const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))
                }
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard key={video.id} data={video} size="compact"/>
                    ))
                }
            </div>
            <InfiniteScroll
                fetchNextPage={query.fetchNextPage}
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
            />
        </>
    )
}