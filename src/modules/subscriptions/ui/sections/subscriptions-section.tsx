"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";

export const SubscriptionsSection = () => {
    return (
        <Suspense fallback={<SubscriptionsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SubscriptionsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const SubscriptionsSectionSkeleton = () => {
    return (
        <>
            <div className="flex flex-col gap-4">
                {Array.from({ length: DEFAULT_LIMIT * 3 }).map((_,i) => (
                    <SubscriptionItemSkeleton key={i} />
                ))}
            </div>
        </>
    )
}

const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils();
    const [data, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: (data) => {
            toast.success("Unsubscribed");

            utils.subscriptions.getMany.invalidate()
            utils.videos.getManySubscribed.invalidate()
            utils.users.getOne.invalidate({ id: data.creatorId })
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {data.pages
                    .flatMap((page) => page.items)
                    .map((subscription) => (
                        <Link key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
                            <SubscriptionItem
                                name={subscription.user.name}
                                imageUrl={subscription.user.imageUrl}
                                subscriberCount={subscription.user.subscriberCount}
                                onUnsubscriber={() => unsubscribe.mutate({ userId: subscription.creatorId })}
                                disabled={unsubscribe.isPending}
                            />
                        </Link>
                    ))
                }
            </div>
            <InfiniteScroll
                fetchNextPage={query.fetchNextPage}
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
            />
        </>
    )
}