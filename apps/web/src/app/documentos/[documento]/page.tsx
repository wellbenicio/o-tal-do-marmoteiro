import { notFound } from "next/navigation";
import { LegalPreview } from "@/components/portal/LegalPreview";
import { legalDocuments } from "@/lib/preview-legal";
export function generateStaticParams() {
  return legalDocuments.map((d) => ({ documento: d.id }));
}
export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ documento: string }>;
}>) {
  const { documento } = await params;
  const doc = legalDocuments.find((d) => d.id === documento);
  if (!doc) notFound();
  return <LegalPreview documentId={doc.id} />;
}
