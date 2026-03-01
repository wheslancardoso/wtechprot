'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export interface TechnicalReportResponse {
    success: boolean
    data?: string
    error?: string
}

export async function generateTechnicalReport(
    userDescription: string,
    orderId?: string,
    equipmentContext?: string
): Promise<TechnicalReportResponse> {
    try {
        if (!userDescription || userDescription.trim().length < 5) {
            return { success: false, error: 'Descrição muito curta para análise.' }
        }

        console.log('🤖 generateTechnicalReport started (Order ID:', orderId, ')')

        let telemetryContext = ''
        let healthAlert = false

        // 1. Fetch ALL Telemetry Data stages if orderId is provided
        if (orderId) {
            const supabase = await createClient()
            const { data: telemetry } = await supabase
                .from('hardware_telemetry')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true }) // Order chronologically

            if (telemetry && telemetry.length > 0) {
                const stagesMap: Record<string, any[]> = {
                    initial: [],
                    post_repair: [],
                    final: []
                }

                telemetry.forEach(t => {
                    const stage = t.stage || 'initial'
                    if (!stagesMap[stage]) stagesMap[stage] = []

                    const metrics = []
                    if (t.cpu_model) metrics.push(`- CPU: ${t.cpu_model}`)
                    if (t.gpu_model) metrics.push(`- GPU: ${t.gpu_model}`)
                    if (t.ram_total_gb) metrics.push(`- RAM: ${t.ram_total_gb}GB`)
                    if (t.cpu_temp_max !== null) metrics.push(`- Temp Máx CPU: ${t.cpu_temp_max}°C`)
                    if (t.ssd_health_percent !== null) metrics.push(`- Saúde SSD: ${t.ssd_health_percent}%`)
                    if (t.ssd_tbw !== null) metrics.push(`- SSD TBW: ${t.ssd_tbw}TB`)
                    if (t.battery_wear_percent !== null) metrics.push(`- Desgaste Bateria: ${t.battery_wear_percent}%`)

                    if (metrics.length > 0) {
                        stagesMap[stage].push(metrics.join('\n'))
                    }

                    // Check for health alert on any final or latest stage
                    if (t.health_score !== null && t.health_score < 70) {
                        healthAlert = true
                    }
                })

                let contextParts = []
                if (stagesMap.initial.length > 0) {
                    contextParts.push(`[ESTÁGIO: INICIAL / DIAGNÓSTICO]\n${stagesMap.initial.join('\n---\n')}`)
                }
                if (stagesMap.post_repair.length > 0) {
                    contextParts.push(`[ESTÁGIO: PÓS-REPARO]\n${stagesMap.post_repair.join('\n---\n')}`)
                }
                if (stagesMap.final.length > 0) {
                    contextParts.push(`[ESTÁGIO: FINAL / ENTREGA]\n${stagesMap.final.join('\n---\n')}`)
                }

                if (contextParts.length > 0) {
                    telemetryContext = `\nEVIDÊNCIAS DE SENSORES POR ESTÁGIO (COMPARAÇÃO OBRIGATÓRIA):\n${contextParts.join('\n\n')}\n`
                }
            } else {
                console.warn('⚠️ No telemetry found for orderId:', orderId)
            }
        }

        const systemPrompt = `
      Você é o Especialista Sênior em Hardware da WFIX, focado em alta performance e diagnóstico laboratorial exato.
      Sua missão é gerar um DETALHAMENTO TÉCNICO PERICIAL baseado na evolução do equipamento durante o reparo.

      IDENTIFICAÇÃO DO ATIVO:
      ${equipmentContext || 'Equipamento em análise'}

      ${telemetryContext}

      REGRAS DE OURO DA PERÍCIA (INVIOLÁVEIS):
      1. ANÁLISE COMPARATIVA: Se houver dados de múltiplos estágios (Ex: Inicial vs Final), você OBRIGATORIAMENTE deve comparar os números. 
         (Ex: "Observou-se uma redução térmica de XX°C após a intervenção, saindo de ${telemetryContext.includes('INICIAL') ? 'VALOR_INICIAL' : ''} para VALOR_FINAL").
      2. CITAÇÃO EXATA: Não use termos vagos como "melhorou". Use "reduziu de 95°C para 65°C". Se o dado está acima, cite-o.
      3. FUNDAMENTAÇÃO TÉCNICA: Correlacione os sintomas (ex: lentidão) com os dados (ex: upgrade de RAM ou thermal throttling).
      4. ${healthAlert ? 'ALERTA DE SEGURANÇA: Score de saúde crítico (<70%). Enfatize riscos de perda de dados.' : 'TOM PROFISSIONAL: Sóbrio, técnico e autoritário.'}

      ESTRUTURA OBRIGATÓRIA:
      
      ANÁLISE INICIAL & SINTOMAS
      [Contexto e sintomas reportados pelo cliente/técnico]

      DIAGNÓSTICO TÉCNICO
      [Onde a evidência fala. Compare os números dos estágios de hardware aqui para provar a eficácia do serviço]

      METODOLOGIA DE REPARO APLICADA / PROPOSTA
      [Detalhamento técnico dos procedimentos realizados]

      CONCLUSÃO E RECOMENDAÇÕES
      [Parecer final, validação da performance pós-reparo e orientações]

      RESTRIÇÃO: Saída apenas o detalhamento técnico. Sem comentários extras.
      
      ENTRADA DO TÉCNICO (RASCUNHO):
      "${userDescription}"
    `

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Como Especialista Sênior, redija o detalhamento técnico pericial comparativo." }
            ],
            temperature: 0,
        })

        const content = completion.choices[0].message.content
        if (!content) throw new Error('Falha na resposta da OpenAI')

        return { success: true, data: content }

    } catch (error) {
        console.error('❌ ERROR in generateTechnicalReport:', error)
        return { success: false, error: 'Falha ao processar detalhamento técnico.' }
    }
}
