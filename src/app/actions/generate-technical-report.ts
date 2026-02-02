'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export interface TechnicalReportResponse {
    success: boolean
    data?: string
    error?: string
}

export async function generateTechnicalReport(userDescription: string, equipmentContext?: string): Promise<TechnicalReportResponse> {
    try {
        if (!userDescription || userDescription.trim().length < 5) {
            return { success: false, error: 'Descrição muito curta para análise.' }
        }

        console.log('🤖 generateTechnicalReport started.')

        const systemPrompt = `
      Você é o Engenheiro Chefe da Assistência Técnica WFIX.
      Sua missão é redigir um LAUDO TÉCNICO PROFISSIONAL E DETALHADO com base nas anotações do técnico.

      DADOS DO EQUIPAMENTO:
      ${equipmentContext || 'Equipamento não especificado (tratar de forma genérica)'}

      OBJETIVO:
      Transformar anotações informais ou breves em um documento técnico formal, denso e bem estruturado, pronto para ser entregue a clientes corporativos ou seguradoras.

      ESTRUTURA IMUTÁVEL (SIGA EXATAMENTE ESTA ORDEM):
      
      ANÁLISE INICIAL & SINTOMAS (CAIXA ALTA)
      [Texto descritivo aqui]

      DIAGNÓSTICO TÉCNICO (CAIXA ALTA)
      [Texto analítico aqui]

      METODOLOGIA DE REPARO APLICADA / PROPOSTA (CAIXA ALTA)
      [Procedimentos técnicos aqui]

      CONCLUSÃO E RECOMENDAÇÕES (CAIXA ALTA)
      [Resultado e dicas aqui]

      REGRA DE OURO:
      Mantenha SEMPRE esse mesmo esqueleto. Não invente novos títulos. Não mude a ordem.
      
      ENTRADA DO TÉCNICO (RASCUNHO):
      "${userDescription}"

      SAÍDA ESPERADA:
      O texto final e nada mais. Sem asteriscos. Sem introduções.
    `

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Gere o laudo técnico padrão WFIX." }
            ],
            temperature: 0, // ZERO para consistência absoluta.
        })

        const content = completion.choices[0].message.content

        if (!content) {
            throw new Error('Retorno vazio da IA')
        }

        return { success: true, data: content }

    } catch (error) {
        console.error('❌ CRITICAL ERROR in generateTechnicalReport:', error)
        return { success: false, error: 'Falha ao gerar laudo técnico. Tente novamente.' }
    }
}
