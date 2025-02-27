import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dinamic = "force-dynamic";

interface PagePros {
  searchParams: Promise<{
    categoryId?: string,
}>
}

const Page = async ({ searchParams }: PagePros) => {
  const  { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch()

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error...</p>}>
          <HomeView categoryId={categoryId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}


export default Page;