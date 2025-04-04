import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type UserGetOneOutPut = 
    inferRouterOutputs<AppRouter>["users"]["getOne"];