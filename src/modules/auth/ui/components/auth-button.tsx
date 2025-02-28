"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs"
import { ClapperboardIcon, UserCircleIcon } from "lucide-react"

export const AuthButton = () => {
    const { isLoaded } = useAuth();
    
    if (!isLoaded) {
        return (
            <Skeleton className="w-7 h-7 rounded-full" />
        )
    }

    return (
        <>
            <SignedIn>
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Link 
                            label="Studio"
                            href="/studio"
                            labelIcon={<ClapperboardIcon  className="size-4"/>}
                        />
                        <UserButton.Action label="manageAccount"/>
                    </UserButton.MenuItems>
                </UserButton>
                {/* Add menu items for studio and user profile */}
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/2 rounded-full shadow-none"
                    >
                        <UserCircleIcon />
                        Sign in
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    )
}