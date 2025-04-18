import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type CommentGetManyOutPut = 
    inferRouterOutputs<AppRouter>["comments"]["getMany"]["items"];