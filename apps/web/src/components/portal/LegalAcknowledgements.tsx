import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { legalDocuments, type LegalDocumentId } from "@/lib/preview-legal";
export function LegalAcknowledgements({
  accepted,
  onChange,
}: Readonly<{
  accepted: LegalDocumentId[];
  onChange: (value: LegalDocumentId[]) => void;
}>) {
  return (
    <>
      <p className="pending-policy">
        Cada documento tem um registro separado. Você está lendo resumos de
        demonstração; os textos integrais serão publicados antes das
        contratações reais.
      </p>
      <div className="legal-acceptances">
        {legalDocuments.map((doc) => (
          <div className="legal-acceptance" key={doc.id}>
            <Link
              href={`/documentos/${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={20} />
              <span>
                <strong>{doc.title}</strong>
                <small>Resumo · {doc.version}</small>
              </span>
              <ExternalLink size={15} />
            </Link>
            <label className="check-label">
              <input
                type="checkbox"
                checked={accepted.includes(doc.id)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...accepted, doc.id]
                      : accepted.filter((id) => id !== doc.id),
                  )
                }
              />
              <span>Li o resumo de {doc.title.toLowerCase()}.</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
