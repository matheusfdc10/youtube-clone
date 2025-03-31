"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
    videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
    return (
        <Suspense fallback={<CommentsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <CommentsSectionSuspense videoId={videoId}/>
            </ErrorBoundary>
        </Suspense>
    )
}

const CommentsSectionSkeleton = () => {
    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <Skeleton className="h-6 w-32"/>
                <div  className="flex gap-4 group">
                    <Skeleton className="h-10 w-10 rounded-full"/>
                    <div className="flex-1">
                        <Skeleton className="h-[58px] w-full"/>
                        <div className="flex justify-end gap-2 mt-2">
                            <Skeleton className="h-8 w-20"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center mt-2">
                <Loader2Icon className="text-muted-foreground size-7 animate-spin"/>
            </div>
            {/* <div className="flex flex-col gap-4 mt-2">
                {Array.from({ length: DEFAULT_LIMIT }).map((_,i) => (
                    <CommentItemSkeleton key={i}/>
                ))}
            </div> */}
        </div>
    )
}

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
    const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery({ videoId, limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">
                    {comments.pages[0].totalCount} Comments
                </h1>
                <CommentForm videoId={videoId} />
            </div>
            <div className="flex flex-col gap-4 mt-2">
                {comments.pages.flatMap((page) => page.items).map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                    />
                ))}
                <InfiniteScroll
                    hasNextPage={query.hasNextPage}
                    isFetchingNextPage={query.isFetchingNextPage}
                    fetchNextPage={query.fetchNextPage}
                />
            </div>
        </div>
    )
}