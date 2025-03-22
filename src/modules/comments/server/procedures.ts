import { z } from "zod";
import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, inArray, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const commentsRouter = createTRPCRouter({
    remove: protectedProcedure
        .input(z.object({ 
            id: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id } = input;
            const { id: userId } = ctx.user;

            const [deletedComment] = await db
                .delete(comments)
                .where(and(
                    eq(comments.id, id),
                    eq(comments.userId, userId)
                ))
                .returning();

            if (!deletedComment) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                })
            }

            return deletedComment
        }),
    create: protectedProcedure
        .input(z.object({ 
            videoId: z.string().uuid(), 
            value: z.string() 
        }))
        .mutation(async ({ input, ctx }) => {
            const { videoId, value } = input;
            const { id: userId } = ctx.user;

            const [createdComment] = await db
                .insert(comments)
                .values({ userId , videoId, value })
                .returning()

            return createdComment
        }),
    update: protectedProcedure
        .input(z.object({ 
            id: z.string().uuid(), 
            value: z.string() 
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, value } = input;
            const { id: userId } = ctx.user;
            
            if (!id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                })
            }

            const [updatedComment] = await db
                .update(comments)
                .set({
                    value,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(comments.id, id),
                    eq(comments.userId, userId)
                ))
                .returning();

            if (!updatedComment) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return updatedComment;
        }),
    getMany: baseProcedure
        .input(z.object({ 
            videoId: z.string().uuid(),
            cursor: z.object({
                id: z.string().uuid(),
                createdAt: z.date()
            }).nullish(),
            limit: z.number().min(1).max(100)
        }))
        .query(async ({ input, ctx }) => {
            const { videoId, cursor, limit } = input;
            const { clerkUserId } = ctx;

            let userId: string | undefined;

            const [user] = await db
                .select()
                .from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

            if (user) {
                userId = user.id
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        commentId: commentReactions.commentId,
                        type: commentReactions.type,
                    })
                    .from(commentReactions)
                    .where(inArray(commentReactions.userId, userId ? [userId] : []))
            )

            const [data, [totalData]] = await Promise.all([
                db
                .with(viewerReactions)
                .select({
                    ...getTableColumns(comments),
                    user: users,
                    viewerReaction: viewerReactions.type,
                    likeCount: db.$count(
                        commentReactions,
                        and(
                            eq(commentReactions.type, "like"),
                            eq(commentReactions.commentId, comments.id)
                        )
                    ),
                    dislikeCount: db.$count(
                        commentReactions,
                        and(
                            eq(commentReactions.type, "dislike"),
                            eq(commentReactions.commentId, comments.id)
                        )
                    )
                })
                .from(comments)
                .where(and(
                    eq(comments.videoId, videoId),
                    cursor 
                        ? or(
                            lt(comments.createdAt, cursor.createdAt),
                            and(
                                eq(comments.createdAt, cursor.createdAt),
                                lt(comments.id, cursor.id)
                            )
                        )
                        : undefined,
                ))
                .innerJoin(users, eq(comments.userId, users.id))
                .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
                .orderBy(desc(comments.createdAt), desc(comments.id))
                .limit(limit + 1),
                db
                .select({
                    count: count(),
                })
                .from(comments)
                .where(eq(comments.videoId, videoId))
            ])

            const hasMore =  data.length > limit;

            const items = hasMore ? data.slice(0, -1) : data;
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ?
                {
                    id: lastItem.id,
                    createdAt: lastItem.createdAt,
                }
                : null

            return {
                items,
                totalCount: totalData.count,
                nextCursor,
            };
        })
})