"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { VideoGetOneOutPut } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface VideoReactionsProps {
    videoId: string;
    likes: number;
    dislikes: number;
    viewerReaction: VideoGetOneOutPut["viewerReaction"];
}

export const VideoReactions = ({
    videoId,
    likes,
    dislikes,
    viewerReaction,
}: VideoReactionsProps) => {
    const clerke = useClerk();
    const utils = trpc.useUtils();

    const like = trpc.videoReactions.like.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId })
            utils.playlists.invalidate()
        },
        onError: (error) => {
            toast.error("Something went wrong");

            if (error.data?.code === "UNAUTHORIZED") {
                clerke.openSignIn();
            }
        }
    })

    const dislike = trpc.videoReactions.dislike.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId })
            utils.playlists.invalidate()
        },
        onError: (error) => {
            toast.error("Something went wrong");

            if (error.data?.code === "UNAUTHORIZED") {
                clerke.openSignIn();
            }
        }
    })

    return (
        <div className="flex items-center flex-none">
            <Button
                variant="secondary"
                className="rounded-l-full rounded-r-none gap-2 pr-4"
                onClick={() => like.mutate({ videoId })}
                disabled={like.isPending || dislike.isPending}
            >
                <ThumbsUpIcon className={cn("size-5", viewerReaction === "like" && "fill-black")}/>
                {likes}
            </Button>
            <Separator orientation="vertical" className="h-7"/>
            <Button
                variant="secondary"
                className="rounded-l-none rounded-r-full pl-3"
                onClick={() => dislike.mutate({ videoId })}
                disabled={dislike.isPending || like.isPending}
            >
                <ThumbsDownIcon className={cn("size-5", viewerReaction === "dislike" && "fill-black")}/>
                {dislikes}
            </Button>
        </div>
    )
}