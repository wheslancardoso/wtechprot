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
        console.log('🤖 generateBudget started.')
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ OPENAI_API_KEY is missing in environment variables!')
            return { success: false, error: 'Configuração de IA ausente (API Key).' }
        }

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
        Você é um Motor de Orçamentos da WFIX. Sua função é classificar serviços e gerar descrições técnicas padronizadas.

        CATÁLOGO DE SERVIÇOS DISPONÍVEL (Use APENAS estes valores):
        ${catalogContext} 
        // O catalogContext deve ser enviado assim: 
        // [{"id": "uuid-1", "name": "Formatação", "price_min": 120, "price_max": 240, "price_avg": 180}, ...]

        DADOS DO EQUIPAMENTO:
        ${equipmentContext}

        REGRAS DE PRECIFICAÇÃO (RÍGIDAS):
        1. IDENTIFICAÇÃO: Encontre o serviço do catálogo que melhor corresponde à solicitação.
        2. CÁLCULO DE PREÇO:
        - Se o valor do equipamento for > R$ 5.000, use o "price_max" do serviço.
        - Se o valor do equipamento for < R$ 2.000, use o "price_min" do serviço.
        - Para outros casos, use estritamente o "price_avg".
        - MUDANÇA DE REGRA: Se o serviço for 'Manutenção Preventiva' ou 'Formatação' simples, prefira a média, salvo se o equipamento for de luxo (Macbook/Gamer).

            --- REGRAS DE ESTILO E FORMATAÇÃO (PADRÃO WFIX V2) ---
            O campo 'commercial_description' deve seguir estritamente este formato visual:

            1. ESTRUTURA VISUAL:
            - PROIBIDO usar marcadores (bolinhas, hífens, listas numeradas).
            - Use QUEBRAS DE LINHA DUPLAS (\n\n) para separar cada bloco de texto. O visual deve ser de parágrafos espaçados.

            2. ORDEM OBRIGATÓRIA DO TEXTO:
            [BLOCO 1: DIAGNÓSTICO] 
            (Descreva o problema técnico encontrado com termos formais. Ex: 'Identificado superaquecimento...')
            
            [BLOCO 2: AÇÃO TÉCNICA PRINCIPAL]
            (Comece com verbos de ação impessoais: 'Realizada...', 'Efetuada...', 'Executada desoxidação...')
            
            [BLOCO 3: PROCEDIMENTOS COMPLEMENTARES]
            (Ex: 'Aplicação de pasta térmica de alta condutividade e manutenção preventiva do sistema de ar...')
            
            [BLOCO 4: UPGRADE/SUGESTÃO] (Opcional)
            (Se houver oportunidade, sugira melhoria. Ex: 'Recomendada instalação de SSD para performance...')

            3. VOCABULÁRIO (AUTORIDADE TÉCNICA):
            - Não use: 'Eu limpei', 'Nós trocamos'.
            - Use: 'Realizada manutenção preventiva', 'Efetuada substituição do componente'.
            - Seja cirúrgico e profissional.

            --- SAÍDA JSON OBRIGATÓRIA ---
            Retorne APENAS este JSON (sem markdown):
            {
            "service_id": "UUID do serviço selecionado no catálogo",
            "suggested_price": 0.00 (Valor decimal exato da tabela conforme regra de preço),
            "commercial_description": "String com o texto formatado usando \\n\\n para os espaços.",
            "difficulty_reasoning": "Breve justificativa do preço (Ex: Equipamento de alto valor, aplicado price_max)."
            }
    `

        // 3. Chamada OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `TEXTO TÉCNICO INFORMAL (RASCUNHO): "${userDescription}"` }
            ],
            response_format: { type: "json_object" },
            temperature: 0, // Zero para máxima consistência
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
        console.error('❌ CRITICAL ERROR in generateBudget:', error)
        if (error instanceof OpenAI.APIError) {
            console.error('OpenAI API Error details:', error.status, error.message, error.code, error.type)
        }
        return { success: false, error: 'Falha ao gerar inteligência. Tente novamente.' }
    }
}
