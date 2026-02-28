# 🚀 Visão de Automação WTechApp (n8n + API Oficial do WhatsApp)

Este documento detalha as possibilidades de automação para transformar o WTechApp em um sistema ultra-eficiente e focado na experiência do cliente, reduzindo o trabalho manual da equipe.

## 1. 📱 Automações de Relacionamento (Experiência do Cliente)

### Atualização de Status em Tempo Real
Sempre que o status de uma Ordem de Serviço (OS) mudar no painel do WTechApp, o cliente é notificado proativamente.
*   **Gatilho:** Webhook do Supabase (Update na tabela `orders` > coluna `status`).
*   **Ação n8n:** Disparar mensagem via API oficial do WhatsApp.
*   **Exemplos:**
    *   `Em Análise` ➡️ "Olá [Nome], seu [Equipamento] já está na bancada com nossos técnicos!"
    *   `Aguardando Aprovação` ➡️ "Olá [Nome], o diagnóstico do seu equipamento está pronto. Acesse o painel para ver o laudo e aprovar o orçamento."
    *   `Pronto para Retirada` ➡️ "Boa notícia, [Nome]! Seu equipamento está consertado e pronto para retirada."

### Gestão de Agendamentos (Confirmação e Lembretes)
*   **Gatilho:** Cliente finaliza um agendamento no site/app.
*   **Ação n8n (Cliente):** Disparar mensagem instantânea: "Olá [Nome]! Seu agendamento para o dia [Data] às [Hora] foi confirmado. Estamos te esperando!"
*   **Ação n8n (Lembrete):** 1 dia antes ou 2 horas antes do serviço, enviar: "Passando para lembrar do nosso agendamento amanhã às [Hora]. Até logo!"

### Envio Automático de PDFs (Laudos e Orçamentos)
*   **Gatilho:** Ação de "Gerar PDF" ou "Enviar para o Cliente" no painel.
*   **Ação n8n:** Pegar a URL pública/assinada do PDF no Supabase Storage e enviar o arquivo diretamente no WhatsApp do cliente junto com uma mensagem explicativa.

### Follow-up de Orçamentos (Recuperação de Vendas)
*   **Gatilho:** Schedule (Agendamento no n8n) rodando todo dia útil às 09:00.
*   **Busca:** Encontrar todas as OS com status `Aguardando Aprovação` onde a data da última atualização (`updated_at`) tem mais de 48 horas.
*   **Ação n8n:** Disparar mensagem: "Olá! Vimos que o orçamento do seu [Equipamento] está aguardando aprovação. Ficou alguma dúvida? Nossa equipe está à disposição. Acesso ao orçamento no painel: [Link]"

### NPS e Pesquisa de Satisfação Pós-Serviço
*   **Gatilho:** Alteração de status da OS para `Entregue/Finalizada` há 3 ou 5 dias.
*   **Ação n8n:** Mensagem: "Olá [Nome], como está funcionando o seu [Equipamento] após o nosso serviço? Avalie nosso atendimento de 1 a 5 ou deixe um review no Google nesse link para nos ajudar!"

---

## 2. 🤖 Agentes de IA Inteligentes (n8n + OpenAI/Anthropic)

### Triage Bot (Pré-Atendimento)
*   **Fluxo:** O cliente entra em contato no WhatsApp. O bot de IA responde inicialmente.
*   **Ação:** A IA entende a demanda. Se o cliente relatar um problema técnico ("Meu PC não liga e apita"), a IA solicita a marca do aparelho e pede fotos. O n8n chama a API do WTechApp e **cria um rascunho de Pré-OS no sistema** automaticamente com os dados e resumo do problema, antes mesmo de um funcionário precisar digitar "Bom dia".

### Leitor de Telas e Logs (Foco B2B)
*   **Fluxo:** Um cliente B2B manda foto de um erro no Windows corporativo ou tela azul no WhatsApp.
*   **Ação n8n:** O n8n envia a imagem para o Vision da OpenAI, que extrai o código do erro, identifica a possível causa e anota a transcrição + solução provável direto no ticket do WTechApp. A equipe interna já abre o chamado com metade do diagnóstico resolvido.

---

## 3. ⚙️ Automações Operacionais e Backoffice (Equipe Interna)

### Notificações Internas (Discord / Slack / Grupo WhatsApp / E-mail)
*   **Gatilhos:**
    *   Novo agendamento realizado por um cliente no site.
    *   Nova OS marcada como SLA Crítico ou pedido de suporte B2B Urgente sendo criado.
*   **Ação n8n:** Mandar um alerta com prioridade no canal interno da equipe ou e-mail do responsável. (ex: "🚨 *Atenção Técnica: Novo Chamado SLA Crítico criado para o Empresa Cliente X.*" ou "📅 *Novo Agendamento: [Nome do Cliente] marcou para [Data] às [Hora].*")

### Sincronização de Visitas Técnicas B2B (Google Calendar)
*   **Gatilho:** Criação de um agendamento de visita no painel.
*   **Ação n8n:** Criar o evento automaticamente no Google Calendar do técnico escalado. Quando faltar 1 hora para a visita, o sistema avisa o técnico e também envia no WhatsApp do cliente: "Nosso técnico [Nome] está a caminho da sua empresa."

### Integração Faturamento (ERP Fiscal)
*   **Gatilho:** Orçamento Aprovado, OS Paga e Finalizada via sistema.
*   **Ação n8n:** O n8n agrupa itens de peças e mão-de-obra separadamente, pega o CNPJ/CPF cadastrado no WTechApp e joga os dados na API do sistema ERP (Bling, Tiny, etc.) para disparar a Nota Fiscal de Serviço (NFS-e) via e-mail sem redigitar nenhum valor.

---

## 🗺️ Roadmap de Implementação Sugerido (Por onde começar?)

Para sentir o retorno rápido do investimento e causar um efeito "Uau" instantâneo:

1.  **Fase 1 (O Básico Uau):** Integração para envio de mensagens automáticas de mudança de status da OS no WhatsApp.
2.  **Fase 2 (Praticidade):** Automação simples para envio dos PDFs na conversa do cliente quando gerados (evitando o velho método do e-mail ou do manual baixar e enviar arquivo por arquivo).
3.  **Fase 3 (Geração de Receita):** O robô passivo de follow-up que tenta "fechar" aqueles orçamentos que o cliente visualizou mas não aprovou nos dias anteriores.
4.  **Fase 4 (O Cérebro IA):** O bot de IA que cria "Pré-OS", tirando o fardo inicial de triagem do atendimento humano.
