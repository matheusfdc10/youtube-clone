import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";


interface PlaylistAddModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoId: string;
}

export const PlaylistAddModal = ({
    open,
    onOpenChange,
    videoId
}: PlaylistAddModalProps) => {
    const utils = trpc.useUtils();
    const {
        data: playlists,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = trpc.playlists.getManyForVideo.useInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
    })

    const addVideo = trpc.playlists.addVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video added to playlist");
            utils.playlists.getMany.invalidate();
            utils.playlists.getManyForVideo.invalidate({ videoId })
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    })

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video removed from playlist");
            utils.playlists.getMany.invalidate();
            utils.playlists.getManyForVideo.invalidate({ videoId })
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    })

    useEffect(() => {
        if (open) {
            utils.playlists.getManyForVideo.reset();
        }
    }, [open, videoId, utils.playlists.getManyForVideo]);

    return (
        <ResponsiveModal
            title="Add to playlist"
            open={open}
            onOpenChange={onOpenChange}
        >
            
            {isLoading && (
                <div className="flex justify-center p-7">
                    <Loader2Icon className="size-7 animate-spin text-muted-foreground"/>
                </div>
            )}
            {!isLoading && (
                playlists?.pages
                    .flatMap((page) => page.items)
                    .map((playlist) => (
                        <Button
                            key={playlist.id}
                            variant="ghost"
                            className="w-full justify-start px-2 [&_svg]:size-5"
                            onClick={() => {
                                if (playlist.containsVideo) {
                                    removeVideo.mutate({ playlistId: playlist.id, videoId })
                                } else {
                                    addVideo.mutate({ playlistId: playlist.id, videoId })
                                }
                            }}
                            disabled={addVideo.isPending || removeVideo.isPending}
                        >
                            {playlist.containsVideo ? (
                                <SquareCheckIcon className="mr-2" />
                            ) : (
                                <SquareIcon className="mr-2" />
                            )}
                            {playlist.name}
                        </Button>
                    ))
            )}
            {!isLoading  && (
                <InfiniteScroll
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isManual
                />
            )}
        </ResponsiveModal>
    )
}