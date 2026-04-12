import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-[75%]" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
