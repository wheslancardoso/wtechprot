// ==================================================
// Termos Jurídicos - CDC, LGPD e Código Civil
// ==================================================

export const LEGAL_TERMS = {
    // ================================================
    // Termo de Diagnóstico (Check-in)
    // ================================================
    diagnostico: {
        title: 'Termo de Autorização de Diagnóstico',
        shortTitle: 'Diagnóstico',
        content: `Autorizo a avaliação técnica do equipamento descrito nesta Ordem de Serviço.

Declaro estar ciente que:

1. A taxa de diagnóstico (se houver) cobre os custos de logística e hora técnica, conforme Art. 40 do Código de Defesa do Consumidor (CDC).

2. A empresa NÃO se responsabiliza por dados não backupeados previamente pelo cliente, conforme Lei 13.709/2018 (LGPD). É de inteira responsabilidade do cliente realizar backup de seus dados antes da entrega do equipamento.

3. Equipamentos não retirados em 90 (noventa) dias após notificação formal serão considerados abandonados, aplicando-se o disposto no Art. 1.275 do Código Civil Brasileiro.

4. O prazo estimado para diagnóstico é de até 7 (sete) dias úteis, podendo variar conforme complexidade do problema.`,
    },

    // ================================================
    // Termo de Aprovação (Compra Assistida)
    // ================================================
    aprovacao: {
        title: 'Termo de Aprovação de Orçamento',
        shortTitle: 'Aprovação',
        content: `Aprovo a execução dos serviços de MÃO DE OBRA descritos neste orçamento.

Declaro estar ciente que:

1. A aquisição de peças externas via link fornecido pela assistência técnica é de MINHA INTEIRA RESPONSABILIDADE.

2. A garantia das peças adquiridas externamente cabe EXCLUSIVAMENTE ao vendedor terceiro, conforme Art. 18 do Código de Defesa do Consumidor (CDC).

3. A assistência técnica garante APENAS a instalação e o serviço prestado pelo prazo de 90 (noventa) dias, contados a partir da data de entrega do equipamento.

4. Defeitos de fabricação em peças externas deverão ser reclamados diretamente ao fornecedor da peça.

5. Ao aprovar este orçamento, autorizo o início imediato dos serviços.`,
    },

    // ================================================
    // Termo de Entrega (Check-out)
    // ================================================
    entrega: {
        title: 'Termo de Recebimento e Garantia',
        shortTitle: 'Entrega',
        content: `Recebi o equipamento em perfeitas condições de funcionamento e estética, conforme registro fotográfico anexo.

Declaro estar ciente que:

1. A GARANTIA de 90 (noventa) dias aplica-se EXCLUSIVAMENTE ao serviço prestado (mão de obra).

2. NÃO estão cobertos pela garantia:
   - Falhas decorrentes de mau uso ou uso indevido
   - Danos causados por quedas, líquidos ou agentes externos
   - Vírus, malware ou software malicioso
   - Instalação de software incompatível
   - Peças adquiridas externamente (garantia do fornecedor)
   - Problemas não relacionados ao serviço original

3. Para acionar a garantia, devo apresentar este comprovante e o equipamento deverá estar nas mesmas condições de entrega.

4. Estou ciente que a violação de lacres ou intervenção por terceiros invalida esta garantia.`,
    },

    // ================================================
    // Termo de Abandono (90 dias)
    // ================================================
    abandono: {
        title: 'Aviso de Abandono',
        shortTitle: 'Abandono',
        content: `Conforme Art. 1.275 do Código Civil Brasileiro, equipamentos não retirados no prazo de 90 (noventa) dias após notificação formal serão considerados abandonados.

A empresa reserva-se o direito de:
- Destinar o equipamento abandonado conforme legislação vigente
- Cobrar taxa de armazenamento proporcional ao período excedente
- Utilizar o valor do equipamento para quitação de débitos pendentes`,
    },

    // ================================================
    // Política de Privacidade (LGPD)
    // ================================================
    lgpd: {
        title: 'Política de Privacidade (LGPD)',
        shortTitle: 'LGPD',
        content: `Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018):

1. Seus dados pessoais serão utilizados exclusivamente para prestação do serviço contratado e comunicação sobre a Ordem de Serviço.

2. Não compartilhamos seus dados com terceiros, exceto quando necessário para execução do serviço.

3. Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.

4. Os dados serão mantidos pelo prazo legal exigido para fins fiscais e contratuais.`,
    },
}

// ================================================
// Tipos
// ================================================
export type LegalTermType = keyof typeof LEGAL_TERMS

// ================================================
// Helpers
// ================================================
export function getLegalTerm(type: LegalTermType) {
    return LEGAL_TERMS[type]
}

export function getAllTerms() {
    return Object.entries(LEGAL_TERMS).map(([key, value]) => ({
        key: key as LegalTermType,
        ...value,
    }))
}

// ================================================
// Textos resumidos para UI compacta
// ================================================
export const LEGAL_SUMMARIES = {
    diagnostico: 'Autorizo o diagnóstico e declaro ciência sobre backup e prazo de retirada.',
    aprovacao: 'Aprovo o orçamento. Peças externas são de minha responsabilidade.',
    entrega: 'Recebi o equipamento funcionando. Garantia de 90 dias sobre o serviço.',
}
