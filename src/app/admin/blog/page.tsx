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

export default function AdminBlogPage() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.blog.list.useQuery();
  const del = api.admin.blog.delete.useMutation({
    onSuccess: async () => {
      toast.success("Deleted");
      await utils.admin.blog.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">Drafts and published journal posts.</p>
        </div>
        <Link href="/admin/blog/new" className={cn(buttonVariants())}>
          New post
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
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
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                <TableCell>{p.isPublished ? "Published" : "Draft"}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/blog/${p.id}`} className="text-sm underline-offset-4 hover:underline">
                    Edit
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ml-3 text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${p.title}”?`)) del.mutate({ id: p.id });
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
