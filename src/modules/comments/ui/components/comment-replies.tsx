import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";

interface CommentRepliesPorps {
    videoId: string;
    parentId: string;
}

export const CommentReplies = ({
    videoId,
    parentId,
}: CommentRepliesPorps) => {
    const { 
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.comments.getMany.useInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId,
        parentId,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    return (
        <div className="pl-14">
            <div className="flex flex-col gap-4 mt-2">
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="size-6 animate-spin text-muted-foreground"/>
                    </div>
                ) : (
                    data?.pages.flatMap((page) => page.items).map((comment) => (
                        <CommentItem key={comment.id} comment={comment} variant="reply"/>
                    ))
                )}
            </div>
            {hasNextPage && !isFetchingNextPage && (
                <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    <CornerDownRightIcon />
                    Show more replies
                </Button>
            )}
            {isFetchingNextPage && (
                <div className="flex items-center justify-center">
                    <Loader2Icon className="size-6 animate-spin text-muted-foreground"/>
                </div>
            )}
        </div>
    )
}