'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export interface BudgetSuggestion {
    service_id: string
    suggested_price: number
    commercial_description: string
    difficulty_reasoning: string
}

export interface GenerateBudgetResponse {
    success: boolean
    data?: BudgetSuggestion
    error?: string
}


export async function generateBudget(userDescription: string, equipmentContext?: string): Promise<GenerateBudgetResponse> {
    try {
        if (!userDescription || userDescription.trim().length < 10) {
            return { success: false, error: 'Descrição muito curta. Detalhe mais o problema.' }
        }

        // 1. Busca Contexto (Catálogo de Serviços)
        const supabase = await createClient()
        const { data: services, error: dbError } = await supabase
            .from('service_catalog')
            .select('id, name, description, price_min, price_max, estimated_time')
            .eq('active', true)

        if (dbError || !services || services.length === 0) {
            console.error('Erro ao buscar serviços:', dbError)
            return { success: false, error: 'Erro ao acessar catálogo de serviços.' }
        }

        // 2. Formata Contexto para IA
        const catalogContext = services.map(s =>
            `- ID: ${s.id} | Serviço: ${s.name} | Desc: ${s.description} | Preço: R$${s.price_min} a R$${s.price_max} | Tempo: ${s.estimated_time || 'N/A'}`
        ).join('\n')

        const systemPrompt = `
      Você é um Especialista de Orçamentos da Assistência Técnica WFIX.
      Sua missão é analisar o texto (relato de defeito ou relatório técnico) e determinar o serviço e preço ideais.
      
      DADOS DO EQUIPAMENTO:
      ${equipmentContext || 'Equipamento genérico (considere valor médio)'}
      
      CATÁLOGO DE SERVIÇOS WFIX:
      ${catalogContext}
      
      METODOLOGIA DE PRECIFICAÇÃO WFIX (JUSTIÇA E BOM SENSO):
      1. TIPO DE SERVIÇO (Fator Principal):
         - Serviços Padronizados (Formatação, Limpeza Simples) -> Devem ficar próximos da MÉDIA ou MÍNIMO, nunca no teto, salvo exceções extremas.
         - Serviços Complexos (Reparo de Placa, Curto) -> Podem ir ao MÁXIMO dependendo do equipamento.
      
      2. VALOR DO EQUIPAMENTO (Fator de Risco):
         - Use o valor do equipamento para ajustar o preço DENTRO do que é justo para o serviço.
         - Ex: Formatar um notebook de R$ 20.000 não custa R$ 800 (seria abusivo). Custa talvez R$ 300 (um pouco acima da média, pelo risco/cuidado).
         - Ex: Formatar um notebook de R$ 1.000 custa o MÍNIMO (ex: R$ 120).

      REGRAS DE ESTILO (PADRÃO WFIX V2 - ESTRUTURA RÍGIDA):
      1. ESTRUTURA VISUAL:
         - NÃO USE MARCADORES (bolinhas, hífens, números). Use apenas quebras de linha duplas para separar os itens.
         - O texto deve parecer um relatório técnico espaçado.
      
      2. ORDEM OBRIGATÓRIA:
         [DIAGNÓSTICO/PROBLEMA ENCONTRADO] (Se houver no texto original, preserve-o. Ex: "Cooler excessivamente empoeirado...")
         (Linha em branco)
         [AÇÃO REALIZADA 1] (Ex: "Realizada limpeza interna...")
         (Linha em branco)
         [AÇÃO REALIZADA 2] (Ex: "Substituição da pasta térmica...")
         (Linha em branco)
         [AÇÃO REALIZADA 3]
         (Linha em branco)
         [SUGESTÃO DE UPGRADE] (Se houver)

      3. VOCABULÁRIO:
         - Comece frases de ação com "Realizada...", "Efetuada...", "Substituição de...", "Reinstalação de...".
         - Seja formal e técnico.

      EXEMPLO DE SAÍDA PERFEITA (Siga este formato):
      "Cooler excessivamente empoeirado, causando desvios de temperatura
      
      Realizada limpeza técnica interna de todo o conjunto dissipador
      
      Substituição da pasta térmica do processador (Prata)
      
      Reinstalação do sistema operacional com drivers atualizados
      
      Sugestão de upgrade: adicionar módulo de memória RAM 8GB DDR4, totalizando 16GB"

      RETORNE APENAS UM JSON VÁLIDO:
      {
        "service_id": "UUID do serviço base",
        "suggested_price": 0.00,
        "commercial_description": "Use o formato de parágrafos espaçados acima (use \\n\\n para pular linhas)",
        "difficulty_reasoning": "Justificativa curta"
      }
    `

        // 3. Chamada OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini-2025-08-07",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `TEXTO TÉCNICO INFORMAL (RASCUNHO): "${userDescription}"` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // Baixa criatividade para garantir respeito aos preços
        })

        const content = completion.choices[0].message.content
        if (!content) {
            throw new Error('Retorno vazio da IA')
        }

        const suggestion = JSON.parse(content) as BudgetSuggestion

        // Validação extra de segurança (Garante que ID existe no catálogo)
        const selectedService = services.find(s => s.id === suggestion.service_id)
        if (!selectedService) {
            // Fallback: Tenta achar pelo nome se o ID vier errado/inventado
            return { success: false, error: 'A IA selecionou um serviço inválido.' }
        }

        // Opcional: Forçar clamp do preço se a IA alucinar for do range
        const finalPrice = Math.min(Math.max(suggestion.suggested_price, selectedService.price_min), selectedService.price_max)
        suggestion.suggested_price = finalPrice

        return { success: true, data: suggestion }

    } catch (error) {
        console.error('Erro na geração de orçamento:', error)
        return { success: false, error: 'Falha ao gerar inteligência. Tente novamente.' }
    }
}
