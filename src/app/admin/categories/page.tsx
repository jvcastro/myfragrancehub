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
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function AdminCategoriesPage() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.category.list.useQuery();
  const del = api.admin.category.delete.useMutation({
    onSuccess: async () => {
      toast.success("Deleted");
      await utils.admin.category.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Used to group products on the storefront.</p>
        </div>
        <Link href="/admin/categories/new" className={cn(buttonVariants())}>
          New category
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : null}
            {data?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c._count.products}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/categories/${c.id}`} className="text-sm underline-offset-4 hover:underline">
                    Edit
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ml-3 text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${c.name}”?`)) del.mutate({ id: c.id });
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
