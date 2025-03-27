import { formatDistanceToNow } from "date-fns";
import { VideoGetManyOutOut } from "../../types";
import { useMemo } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoInfoProps {
    data: VideoGetManyOutOut["items"][number];
    onRemove?: () => void;
}

export const VideoInfo = ({
    data,
    onRemove
}: VideoInfoProps) => {
    const router = useRouter();

    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(data.viewCount)
    }, [data.viewCount]);
    
    const compactDate = useMemo(() => {
        return formatDistanceToNow(data.createdAt, { addSuffix: true })
    }, [data.createdAt])

    return (
        <div className="flex gap-3">
            <Link href={`/videos/${data.id}`} className="flex-1 flex gap-3">
                <span 
                    className="inline-block h-fit"
                    onClickCapture={(e) => {
                        e.stopPropagation();
                        router.push(`/users/${data.user.id}`)
                    }}
                >
                    <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name}/>
                </span>
                <div className="min-w-0 flex-1">
                    <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
                        {data.title}
                    </h3>
                    <span className="inline-block w-fit" 
                        onClickCapture={(e) => {
                            e.stopPropagation();
                            router.push(`/users/${data.user.id}`)
                        }}
                    >
                        <UserInfo name={data.user.name}/>
                    </span>
                    <p className="text-sm text-gray-600 line-clamp-1">
                        {compactViews} views • {compactDate}
                    </p>
                </div>
            </Link>
            <div className="flex-shrink-0">
                <VideoMenu videoId={data.id} onRemove={onRemove}/>
            </div>
        </div>
    )
}

export const VideoInfoSkeleton = () => {
    return (
        <div className="flex gap-3">
            <div className="flex-1 flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full"/>
                <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="w-full h-6"/>
                    <Skeleton className="w-[50%] h-5"/>
                    <Skeleton className="w-44 h-5"/>
                </div>
            </div>
            <div className="flex-shrink-0">
                <Skeleton className="w-7 h-7 rounded-full"/>
            </div>
        </div>
    )
}