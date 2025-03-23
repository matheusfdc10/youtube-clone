"use client"

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useEffect, useState } from "react";

interface SuggestionsSectionProps {
    videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
    const [suggestions, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({
        videoId,
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    const [isSmall, setIsSmall] = useState(window.innerWidth < 1280);

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