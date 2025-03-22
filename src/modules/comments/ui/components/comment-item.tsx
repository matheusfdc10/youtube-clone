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
import { MoreVerticalIcon, Trash2Icon, PencilIcon, FlagIcon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { CommentForm } from "./comment-form";

interface CommentItemProps {
    comment: CommentGetManyOutPut[number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
    const { userId } = useAuth();
    const clerk = useClerk();
    const [edit, setEdit] = useState(false);

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
                <Link href={`/users/${comment.userId}`}>
                    <UserAvatar
                        size="lg"
                        imageUrl={comment.user.imageUrl || '/user-placeholder.svg'}
                        name={comment.user.name}
                    />
                </Link>

                {edit ? (
                    <CommentForm videoId={comment.videoId} comment={comment} onCancel={() => setEdit(false)}/>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <Link href={`/users/${comment.userId}`}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-medium text-sm pb-0.5">
                                        {comment.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt, {
                                            addSuffix: true,
                                        })}
                                        {comment.updatedAt && " (edited)"}
                                    </span>
                                </div>
                            </Link>
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
                                        <DropdownMenuItem onClick={() => setEdit(true)}>
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