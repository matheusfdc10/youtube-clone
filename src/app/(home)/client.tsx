"use client"

import { trpc } from "@/trpc/client"

export const PageClient = () => {
    const [data] = trpc.hello.useSuspenseQuery({ text: "Test"})

    return (
        <div>
            Page client: { data?.greeting }
        </div>
    )
}