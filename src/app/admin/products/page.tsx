"use client";

import Link from "next/link";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhp } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function AdminProductsPage() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.product.list.useQuery();
  const del = api.admin.product.delete.useMutation({
    onSuccess: async () => {
      toast.success("Deleted");
      await utils.admin.product.list.invalidate();
      await utils.admin.dashboard.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and remove catalog items.</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants())}>
          New product
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : null}
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.brand.name}</TableCell>
                <TableCell>{p.category.name}</TableCell>
                <TableCell className="tabular-nums">
                  {formatPhp(p.price.toString())}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.isSoldOut ? "Sold out" : "Available"}
                  {p.isFeatured ? " · Featured" : ""}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ml-3 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${p.name}”?`)) del.mutate({ id: p.id });
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
