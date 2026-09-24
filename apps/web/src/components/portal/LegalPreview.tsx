import Link from "next/link";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { legalDocuments, type LegalDocumentId } from "@/lib/preview-legal";
export function LegalPreview({
  documentId,
}: Readonly<{ documentId?: LegalDocumentId }>) {
  const documents = documentId
    ? legalDocuments.filter((d) => d.id === documentId)
    : legalDocuments;
  return (
    <main className="legal-page">
      <Link href={documentId ? "/termos" : "/"} className="back-link">
        <ArrowLeft size={16} />
        {documentId ? "Todos os documentos" : "Voltar para o site"}
      </Link>
      <span className="portal-eyebrow">TRANSPARÊNCIA EM CADA ETAPA</span>
      <h1>
        {documentId ? (
          documents[0].title
        ) : (
          <>
            Clareza também faz
            <br />
            parte do cuidado.
          </>
        )}
      </h1>
      <p className="page-description">
        Conheça as condições que orientam sua experiência.
      </p>
      <div className="demo-banner">
        <FileText size={20} />
        <p>
          Resumos de demonstração baseados na especificação de 21/09/2026. Os
          documentos jurídicos integrais e suas novas versões publicáveis ainda
          precisam ser incorporados. Estes resumos não substituem os contratos e
          nenhum aceite nesta prévia gera contratação real.
        </p>
      </div>
      {!documentId && (
        <nav className="legal-tabs" aria-label="Documentos">
          {legalDocuments.map((d) => (
            <a href={`#${d.id}`} key={d.id}>
              {d.title}
            </a>
          ))}
        </nav>
      )}
      {documents.map((doc) => (
        <section
          id={doc.id}
          key={doc.id}
          className="portal-card legal-document"
        >
          <span className="portal-eyebrow">RESUMO DE DEMONSTRAÇÃO</span>
          <h2>{doc.title}</h2>
          <p className="legal-version">Versão da prévia: {doc.version}</p>
          {doc.sections.map(([title, content]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{content}</p>
            </article>
          ))}
        </section>
      ))}
      <section className="portal-card">
        <h2>
          <Mail size={20} /> Fale com a gente
        </h2>
        <p>
          Para suporte, cancelamento ou assuntos de privacidade:{" "}
          <a className="text-link" href="mailto:falecom@marmoteiro.com">
            falecom@marmoteiro.com
          </a>
          . O cancelamento também estará disponível na própria área do cliente.
        </p>
      </section>
      <Link href="/agendar" className="product-button">
        Conhecer a contratação de demonstração
      </Link>
    </main>
  );
}
