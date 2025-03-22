"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CommentGetManyOutPut } from "../../types";
import { useEffect, useRef } from "react";
import { UserAvatar } from "@/components/user-avatar";

interface CommentFormProps {
    videoId: string;
    parentId?: string;
    comment?: CommentGetManyOutPut[number];
    onSuccess?: () => void;
    onCancel?: () => void;
    variant?: "comment" | "reply" | "update",
}

const schema = commentInsertSchema.omit({ userId: true })

export const CommentForm = ({ 
    videoId,
    parentId,
    comment,
    onSuccess,
    onCancel,
    variant = "comment",
}: CommentFormProps) => {
    const clerk = useClerk();
    const { user } = useUser();

    const utils = trpc.useUtils();
    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId })
            form.reset();
            toast.success("Comment added");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error("Something went wrong");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    const update = trpc.comments.update.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId })
            form.reset();
            toast.success("Comment added");
            onSuccess?.();
            onCancel?.();
        },
        onError: (error) => {
            toast.error("Something went wrong");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            videoId,
            parentId,
            value: comment?.value || "",
        }
    })

    const handleSubmit = (values: z.infer<typeof schema>) => {
        if (variant === "update" && comment) {
            update.mutate({ 
                id: comment.id,
                value: values.value, 
            })
        } else {
            create.mutate(values)
        }
    }

    const placeholder = variant === "reply" ? "Reply to this comment..." : variant === "update" ? "Update comment..." : "Add a comment...";
    const textButtonSubmit = variant === "reply" ? "Reply" : variant === "update" ? "Save" : "Comment";

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current && comment?.value) {
            const textarea = textareaRef.current;
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
            textarea.scrollTop = textarea.scrollHeight;

            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [comment]);

    const value = form.watch("value");

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)} 
                className="flex gap-4 group"
            >
                <UserAvatar 
                    size={variant === "comment" ? "lg" : "sm"}
                    imageUrl={user?.imageUrl || "/user-placeholder.svg"}
                    name={user?.username || "User"}
                />
                <div 
                    className="flex-1"
                >
                    <FormField
                        name="value"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        ref={textareaRef}
                                        placeholder={placeholder}
                                        className="resize-none bg-transparent overflow-hidden min-h-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        {onCancel && (
                            <Button
                                onClick={handleCancel}
                                disabled={create.isPending || update.isPending}
                                type="button"
                                variant="ghost"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            disabled={create.isPending || update.isPending || !value}
                            type="submit"
                            size="sm"
                        >
                            {textButtonSubmit}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}