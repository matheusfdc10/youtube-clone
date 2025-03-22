import Link from "next/link";
import { CommentGetManyOutPut } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, Trash2Icon, PencilIcon, FlagIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";

interface CommentItemProps {
    comment: CommentGetManyOutPut[number];
    variant?: "reply" | "comment",
}

export const CommentItem = ({ 
    comment,
    variant = "comment"
}: CommentItemProps) => {
    const { userId } = useAuth();
    const clerk = useClerk();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);

    const utils = trpc.useUtils()
    const remove = trpc.comments.remove.useMutation({
        onSuccess: () => {
            toast.success("Comment deleted")
            utils.comments.getMany.invalidate({ videoId: comment.videoId })
        },
        onError: (error) => {
            toast.error("Something went wrong")

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    const like = trpc.commentReactions.like.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId: comment.videoId })
        },
        onError: (error) => {
            toast.error("Something went wrong")
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });
    const dislike = trpc.commentReactions.dislike.useMutation(
        {
            onSuccess: () => {
                utils.comments.getMany.invalidate({ videoId: comment.videoId })
            },
            onError: (error) => {
                toast.error("Something went wrong")
                if (error.data?.code === "UNAUTHORIZED") {
                    clerk.openSignIn();
                }
            }
        }
    );

    const paragraphRef = useRef<HTMLParagraphElement>(null);
    const [isClamped, setIsClamped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const checkClamping = () => {
        if (paragraphRef.current) {
            const isOverflowing = paragraphRef.current.scrollHeight > paragraphRef.current.clientHeight;
            setIsClamped(isOverflowing);
        }
        };

        const observer = new ResizeObserver(checkClamping);
        if (paragraphRef.current) observer.observe(paragraphRef.current);

        checkClamping();

        return () => observer.disconnect();
    }, [comment.value]);

    return (
        <div>
            <div className="flex gap-4">
                {isEditOpen ? (
                    <div className="flex-1">
                        <CommentForm variant="update" videoId={comment.videoId} comment={comment} onCancel={() => setIsEditOpen(false)}/>
                    </div>
                ) : (
                    <>
                        <Link href={`/users/${comment.userId}`}>
                            <UserAvatar
                                size={variant === "comment" ? "lg" : "sm"}
                                imageUrl={comment.user.imageUrl || '/user-placeholder.svg'}
                                name={comment.user.name}
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Link href={`/users/${comment.userId}`}>
                                    <span className="font-medium text-sm pb-0.5">
                                        {comment.user.name}
                                    </span>
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(comment.createdAt, {
                                        addSuffix: true,
                                    })}
                                    {comment.updatedAt && " (edited)"}
                                </span>
                            </div>
                            
                            <p 
                                ref={paragraphRef}
                                className={cn(
                                    "text-sm break-words whitespace-pre-wrap",
                                    !isExpanded && "line-clamp-4",
                                )}
                            >
                                {comment.value}
                            </p>
                            {(isClamped || isExpanded) && (
                                <div
                                    onClick={() => setIsExpanded((current) => !current)}
                                    className="mt-1 text-xs text-muted-foreground cursor-pointer hover:underline"
                                >
                                    {isExpanded ? (
                                        <>
                                            Show less
                                        </>
                                    ) : (
                                        <>
                                            Read more 
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                    <Button
                                        onClick={() => like.mutate({ commentId: comment.id })}
                                        disabled={like.isPending || dislike.isPending}
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <ThumbsUpIcon className={cn(
                                            comment.viewerReaction === "like" && "fill-black"
                                        )}/>
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        {comment.likeCount}
                                    </span>
                                    <Button
                                        onClick={() => dislike.mutate({ commentId: comment.id })}
                                        disabled={dislike.isPending || like.isPending}
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <ThumbsDownIcon className={cn(
                                            comment.viewerReaction === "dislike" && "fill-black"
                                        )}/>
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        {comment.dislikeCount}
                                    </span>
                                    
                                </div>
                                {variant === "comment" && (
                                    <Button
                                        onClick={() => setIsReplyOpen(true)}
                                        disabled={false}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 font-medium"
                                    >
                                        Reply
                                    </Button>
                                )}
                            </div>
                        </div>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                >
                                    <MoreVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {comment.user.clerkId === userId ? (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                            <PencilIcon className="size-4"/>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })} disabled={remove.isPending}>
                                            <Trash2Icon className="size-4"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem>
                                        <FlagIcon className="size-4"/>
                                        Report
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>

            {isReplyOpen && variant === "comment" && (
                <div className="mt-4 pl-14">
                    <CommentForm
                        variant="reply"
                        videoId={comment.videoId}
                        parentId={comment.id}
                        onCancel={() => {
                            setIsReplyOpen(false);
                        }}
                        onSuccess={() => {
                            setIsReplyOpen(false);
                            setIsRepliesOpen(true);
                        }}
                    />
                </div>
            )}

            {comment.replyCount && variant === "comment" && (
                <div className="pl-14">
                    <Button
                        onClick={() => setIsRepliesOpen((current) => !current)}
                        variant="tertiary"
                    >   
                    {isRepliesOpen ? (
                        <ChevronUpIcon /> 
                    ) : (
                        <ChevronDownIcon /> 
                    )}
                    {comment.replyCount} replies
                    </Button>
                </div>
            )}

            {comment.replyCount && variant === "comment" && isRepliesOpen && (
                <CommentReplies parentId={comment.id} videoId={comment.videoId}/>
            )}
        </div>
    )
}

export const CommentItemSkeleton = () => {
    return (
        <div>
            <div className="flex gap-4">
                <Skeleton className="rounded-full h-10 w-10" />

                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}