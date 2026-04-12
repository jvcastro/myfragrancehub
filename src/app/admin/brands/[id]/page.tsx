import { BrandEditor } from "@/components/admin/brand-editor";

export default async function AdminEditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrandEditor brandId={id} />;
}
