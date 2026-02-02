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

        // 1. Fetch Telemetry Data if orderId is provided
        if (orderId) {
            const supabase = await createClient()
            const { data: telemetry } = await supabase
                .from('hardware_telemetry')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: false })

            if (telemetry && telemetry.length > 0) {
                const t = telemetry[0]
                const metrics = []

                if (t.cpu_temp_max) metrics.push(`- Temperatura Máxima CPU: ${t.cpu_temp_max}°C`)
                if (t.ssd_health_percent) metrics.push(`- Saúde do SSD: ${t.ssd_health_percent}%`)
                if (t.ssd_tbw) metrics.push(`- Escrita no SSD (TBW): ${t.ssd_tbw} TB`)
                if (t.battery_wear_percent !== null && t.battery_wear_percent !== undefined) metrics.push(`- Desgaste da Bateria: ${t.battery_wear_percent}%`)
                if (t.ram_speed) metrics.push(`- Velocidade RAM: ${t.ram_speed} MHz`)
                if (t.ram_slots) metrics.push(`- Slots de RAM: ${t.ram_slots}`)
                if (t.ssd_total_gb) metrics.push(`- Capacidade de Armazenamento: ${t.ssd_total_gb} GB`)

                if (metrics.length > 0) {
                    telemetryContext = `\nREQUISITOS TÉCNICOS COLETADOS VIA SENSORES:\n${metrics.join('\n')}\n`

                    if (t.health_score !== null && t.health_score < 70) {
                        healthAlert = true
                    }
                }
            }
        }

        const systemPrompt = `
      Você é o Engenheiro Chefe da Assistência Técnica WFIX, especializado em perícia de hardware.
      Sua missão é redigir um LAUDO TÉCNICO PROFISSIONAL E DETALHADO com base nas anotações do técnico e dados de hardware coletados.

      DADOS DO EQUIPAMENTO:
      ${equipmentContext || 'Equipamento não especificado'}
      ${telemetryContext}

      OBJETIVO:
      Transformar as anotações e os dados brutos de hardware em um documento técnico formal, denso e pericial. 
      
      REGRAS CRÍTICAS DE CONTEÚDO:
      1. CITE EXPLICITAMENTE os números coletados pelos sensores no texto (ex: se houver temperatura, cite o valor exato). Isso dá autoridade ao laudo.
      2. ${healthAlert ? 'O equipamento apresenta baixo score de saúde (<70%). Use um tom de ALERTA e URGÊNCIA, enfatizando riscos de perda de dados ou falha iminente.' : 'Use um tom profissional, analítico e técnico.'}
      3. Se não houver dados de telemetria, não invente números; foque apenas no diagnóstico visual e rascunho do técnico.

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
      Mantenha SEMPRE esse esqueleto. Saída deve ser apenas o texto do laudo, sem introduções.
      
      ENTRADA DO TÉCNICO (RASCUNHO):
      "${userDescription}"
    `

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Gere o laudo técnico pericial WFIX baseado nos dados fornecidos." }
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
