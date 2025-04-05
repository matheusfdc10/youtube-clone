import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "./subscription-button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionItemProps {
    name: string;
    imageUrl: string;
    subscriberCount: number;
    onUnsubscriber: () => void;
    disabled: boolean;
}

export const SubscriptionItem = ({
    name,
    imageUrl,
    subscriberCount,
    onUnsubscriber,
    disabled,
}: SubscriptionItemProps) => {
    return (
        <div className="flex items-start gap-4">
            <UserAvatar
                size="lg"
                imageUrl={imageUrl}
                name={name}
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm">
                            {name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {subscriberCount.toLocaleString()} subscribers
                        </p>
                    </div>
                    <SubscriptionButton
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onUnsubscriber();
                        }}
                        disabled={disabled}
                        isSubscribed
                    />
                </div>
            </div>
        </div>
    )
}

export const SubscriptionItemSkeleton = () => {
    return (
        <div className="flex items-start gap-4">
            <Skeleton className="size-10 rounded-full"/>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32"/>
                        <Skeleton className="h-4 w-24"/>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full"/>
                </div>
            </div>
        </div>
    )
}