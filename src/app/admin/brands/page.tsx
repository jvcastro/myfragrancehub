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

export default function AdminBrandsPage() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.brand.list.useQuery();
  const del = api.admin.brand.delete.useMutation({
    onSuccess: async () => {
      toast.success("Deleted");
      await utils.admin.brand.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Brands</h1>
          <p className="text-sm text-muted-foreground">Houses and makers linked to products.</p>
        </div>
        <Link href="/admin/brands/new" className={cn(buttonVariants())}>
          New brand
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
            {data?.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                <TableCell>{b._count.products}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/brands/${b.id}`} className="text-sm underline-offset-4 hover:underline">
                    Edit
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ml-3 text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${b.name}”?`)) del.mutate({ id: b.id });
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
