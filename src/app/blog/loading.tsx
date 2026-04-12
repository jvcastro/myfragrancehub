import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-4 h-12 w-[66%] max-w-md" />
      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
