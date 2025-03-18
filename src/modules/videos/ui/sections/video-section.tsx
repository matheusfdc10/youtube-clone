"use client"

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer } from "../components/video-player";
import { VideoBanner } from "../components/video-banner";
import { VideoTopRow } from "../components/video-top-row";

interface VideoSectionProps {
    videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
    return (
        <Suspense fallback={<VideoSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <VideoSectionSuspense videoId={videoId}/>
            </ErrorBoundary>
        </Suspense>
    )
}

const VideoSectionSkeleton = () => {
    return <div>loading...</div>
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
    const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

    return (
        <>
            <div className={cn(
                "aspect-video bg-black rounded-xl overflow-hidden relative",
                video.muxSttaus !== "ready" && "rounded-b-none",
            )}>
                <VideoPlayer
                    autoPlay
                    onPlay={() => {}}
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                />
            </div>
            <VideoBanner status={video.muxSttaus}/>
            <VideoTopRow video={video} />
        </>
    )
}