"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosSectionProps {
    playlistId: string;
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
    return (
        <Suspense key={playlistId} fallback={<VideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <VideosSectionSuspense playlistId={playlistId}/>
            </ErrorBoundary>
        </Suspense>
    )
}

const VideosSectionSkeleton = () => {
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

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
    const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery({
        playlistId,
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    const utils = trpc.useUtils()

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video removed from playlist");
            utils.playlists.getMany.invalidate();
            utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId })
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    })

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard 
                            key={video.id} 
                            data={video} 
                            onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id})}
                        />
                    ))
                }
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard 
                            key={video.id} 
                            data={video} 
                            onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id})} 
                            size="compact"
                        />
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