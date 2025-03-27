import { cva, type VariantProps } from "class-variance-authority"
import { Avatar, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const avatarVariant = cva("", {
    variants: {
        size: {
            default: "h-9 w-9",
            xs: "h-4 w-4",
            sm: "h-6 w-6",
            lg: "h-10 w-10",
            xl: "h-[160px] w-[160px]"
        }
    },
    defaultVariants: {
        size: "default",
    }
})

interface UserAvatarProps extends VariantProps<typeof avatarVariant> {
    imageUrl: string;
    name: string;
    className?: string;
    onClick?: () => void;
}

export const UserAvatar = ({
    imageUrl,
    name,
    className,
    onClick,
    size
}: UserAvatarProps) => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <Avatar className={cn(avatarVariant({ size, className }), isLoading && "animate-pulse bg-primary/10")} onClick={onClick}>
            <AvatarImage onLoad={() => setIsLoading(false)} src={imageUrl} alt={name}/>
        </Avatar>
    )
}