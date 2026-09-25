export const legalDocuments = [
  {
    id: "terms",
    title: "Termos de atendimento",
    version: "PREVIA-BASELINE-2026-09-21",
    sections: [
      [
        "Sobre o atendimento",
        "Atendimento oracular de caráter espiritual e reflexivo. Não substitui orientação médica, psicológica, jurídica ou financeira. A consulta online acontece em horário reservado; a pergunta avulsa é respondida pelo WhatsApp com identificação da pergunta, foto do jogo e áudio.",
      ],
      [
        "Reagendamento",
        "Cada consulta permite um único reagendamento por iniciativa do consulente, sem cobrança adicional, solicitado com pelo menos 24 horas de antecedência. Você tem 48 horas após a apresentação das opções para escolher. O direito só é consumido com a confirmação do novo horário. Alteração provocada pelo prestador não consome esse direito e permite optar pela restituição integral do serviço não realizado.",
      ],
      [
        "Cancelamento e arrependimento",
        "Você pode solicitar cancelamento ou arrependimento na sua área e acompanhar o protocolo. Quando juridicamente aplicável, o prazo legal de arrependimento é de sete dias. Direitos legais obrigatórios prevalecem sobre retenções contratuais. Pedidos após a entrega ou situações excepcionais podem exigir análise manual justificada.",
      ],
      [
        "Cancelamento tardio e ausência",
        "Com menos de 24 horas de antecedência, quando a regra contratual for aplicável, a retenção é de 30% e a restituição de 70%. No-show tem tolerância de 15 minutos; quando caracterizado e aplicável, retenção de 50% e restituição de 50%, sem direito a reagendamento. Falha do prestador/plataforma e situações excepcionais exigem avaliação.",
      ],
      [
        "Pergunta avulsa e prioridade",
        "Prazo máximo de 48 horas úteis desde a confirmação do pagamento, conforme calendário operacional apresentado antes da contratação. Prioridade passa à frente das perguntas regulares ainda não iniciadas, não interrompe uma execução e não muda o SLA. O adicional integra o total para reembolso. Estar na fila não significa início: o administrador registra início e entrega. Iniciar não elimina, por si só, direito de arrependimento.",
      ],
    ],
  },
  {
    id: "privacy",
    title: "Privacidade e proteção de dados",
    version: "PREVIA-BASELINE-2026-09-21",
    sections: [
      [
        "Dados cadastrais",
        "O cadastro contempla nome civil e social, nascimento, nome da mãe, identidade de gênero, pronomes quando informados, e-mail e WhatsApp. Nome social e pronomes apoiam o tratamento adequado. E-mail e telefone são editáveis; dados estruturais exigem solicitação de correção, com decisão e histórico.",
      ],
      [
        "Cuidado com o conteúdo",
        "Perguntas, interpretações, áudios e imagens podem revelar informações sensíveis. Seu tratamento deve ser restrito, com minimização, controle de acesso e retenção por finalidade. Evite compartilhar documentos, dados bancários ou informações excessivas de terceiros.",
      ],
      [
        "Seus direitos",
        "A área de privacidade permite solicitar acesso, correção e outros direitos aplicáveis, acompanhando o protocolo. O canal oficial de contato e privacidade é falecom@marmoteiro.com.",
      ],
      [
        "Esta demonstração",
        "Use exclusivamente dados fictícios. As informações da prévia permanecem nesta sessão do navegador e são apagadas ao sair. Nenhuma senha é armazenada ou validada, nenhum e-mail é enviado e nenhum pagamento real é efetuado.",
      ],
    ],
  },
  {
    id: "confidentiality",
    title: "Confidencialidade e sigilo",
    version: "PREVIA-BASELINE-2026-09-21",
    sections: [
      [
        "Um espaço reservado",
        "Identidade, contato, perguntas, histórias pessoais, cartas, interpretações, mensagens, áudios e imagens podem ser confidenciais. O conteúdo da consulta deve ter acesso mais restrito que o histórico administrativo.",
      ],
      [
        "Publicação e compartilhamento",
        "Contratar não autoriza publicar seu nome, foto, áudio, vídeo, print, pergunta, resultado ou depoimento identificável. A autorização para publicação deve ser específica e separada.",
      ],
      [
        "Gravação",
        "Aceitar os termos não autoriza gravação. A escolha é separada e recusar não impede ordinariamente a consulta. A retenção operacional é de até 90 dias após o atendimento, ressalvada preservação necessária para reclamação, contestação, litígio ou exercício regular de direitos.",
      ],
    ],
  },
] as const;
export type LegalDocumentId = (typeof legalDocuments)[number]["id"];
export type LegalAcceptance = {
  documentId: LegalDocumentId;
  title: string;
  version: string;
  acceptedAt: string;
  manifestation: string;
};
export function previewAcceptances(
  ids: LegalDocumentId[],
  at: string,
): LegalAcceptance[] {
  return legalDocuments
    .filter((d) => ids.includes(d.id))
    .map((d) => ({
      documentId: d.id,
      title: d.title,
      version: d.version,
      acceptedAt: at,
      manifestation:
        "Li o resumo de demonstração; não constitui aceite contratual real.",
    }));
}
