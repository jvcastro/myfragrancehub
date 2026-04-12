import { BlogEditor } from "@/components/admin/blog-editor";

export default async function AdminEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditor postId={id} />;
}
