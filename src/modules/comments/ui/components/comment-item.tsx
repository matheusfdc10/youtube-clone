import Link from "next/link";
import { CommentGetManyOutPut } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CommentItemProps {
    comment: CommentGetManyOutPut[number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
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
                            </span>
                        </div>
                    </Link>
                    <p 
                        ref={paragraphRef}
                        className={cn(
                            "text-sm break-words",
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
            </div>
        </div>
    )
}