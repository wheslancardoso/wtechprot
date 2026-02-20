export const APPROVAL_TERMS = [
    {
        id: 'warranty_split',
        title: '1. Garantia e Compra Assistida',
        content: 'Declaro ciência de que estou contratando a MÃO DE OBRA técnica. A garantia legal de 90 dias (Art. 26 CDC) aplica-se exclusivamente ao serviço. Peças adquiridas externamente possuem garantia direta com o vendedor/fabricante. Caso a peça externa apresente defeito, uma nova taxa de montagem poderá ser cobrada.',
        required: true,
        icon: 'wrench'
    },

    {
        id: 'data_backup',
        title: '3. Dados e Backup (LGPD)',
        content: 'Declaro que possuo backup prévio de todos os meus dados (fotos, contatos, arquivos). Isento a central de soluções técnicas de responsabilidade por eventual perda de dados decorrente de falhas de hardware (memória/placa) ou necessidade de formatação/restauração de software.',
        required: true,
        icon: 'database'
    },
    {
        id: 'abandonment',
        title: '4. Política de Abandono',
        content: 'Concordo que equipamentos não retirados em até 90 dias após a notificação de conclusão (via WhatsApp/E-mail) serão considerados abandonados, podendo a assistência dar-lhes destinação para custeio de despesas de armazenamento, conforme Art. 1.275 do Código Civil.',
        required: true,
        icon: 'clock'
    },
    {
        id: 'diagnosis_fee',
        title: '5. Validade e Taxas',
        content: 'Este orçamento é válido por 10 dias. Estou ciente que a reprovação posterior ou desistência após o início do serviço implicará na cobrança da Taxa de Diagnóstico/Visita Técnica já informada.',
        required: true,
        icon: 'file-text'
    }
] as const;

export type LegalTermType = typeof APPROVAL_TERMS[number]['id'];

export const LEGAL_TERMS = APPROVAL_TERMS.reduce((acc, term) => {
    acc[term.id] = term;
    return acc;
}, {} as Record<LegalTermType, typeof APPROVAL_TERMS[number]>);
