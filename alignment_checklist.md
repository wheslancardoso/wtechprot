# Checklist de Alinhamento - WTech SaaS

Este documento serve para validar o estado atual do projeto e definir os próximos passos.

## 🚀 Funcionalidades Recentes (Para Validar)

### 1. PDF de Garantia e Recibo
- [ ] **Dados da Loja:** O PDF está puxando corretamente o Nome Fantasia, CNPJ e Logo configurados em `/dashboard/settings`?
- [ ] **Fluxo de Finalização:** Ao finalizar uma OS, o botão de download do PDF aparece na tela de sucesso?
- [ ] **Termos Jurídicos:** O texto de "Termo de Garantia" no PDF está adequado (90 dias mão de obra vs peças)?

### 2. Configurações da Loja (Multi-tenant)
- [ ] **Página de Settings:** Consegue salvar e atualizar as informações da loja sem erros?
- [ ] **Alerta de Cadastro:** O alerta "Complete seu cadastro" desaparece após salvar os dados obrigatórios?
- [ ] **Logo:** O upload da logo está funcionando e reflete no PDF?

### 3. Smart IDs
- [ ] **Formato:** As novas OS estão sendo geradas com o formato `ANO-PREFIX-SEQUENCIA` (ex: `2025-WT-0001`)?
- [ ] **Busca:** É possível buscar a OS pelo novo ID na listagem ou barra de busca?

## 🚧 Em Andamento / Pendente

### 1. Módulo Financeiro
- [ ] **Chaves Pix:** O campo de chave Pix nas configurações ainda é visual. Precisamos integrar isso no Recibo/PDF?
- [ ] **Relatórios:** Os gráficos da Home estão com dados reais ou mockados?

### 2. Notificações WhatsApp
- [ ] **Templates:** As mensagens automáticas estão configuradas?
- [ ] **Gatilhos:** O envio ocorre automaticamente ao mudar status (ex: "Pronto")?

### 3. Checklist de Execução
- [ ] **Técnicos:** A tela de execução para técnicos (checklist de entrada/saída) está 100% funcional?

## ❓ Dúvidas / Decisões

1.  **Impressão Térmica:** O PDF atual é A4. Precisamos de uma versão específica para impressora térmica (80mm)?
2.  **Gateways de Pagamento:** Há plano de integrar pagamento online (Stripe/Asaas) ou manteremos apenas registro manual?
3.  **Domínio:** Qual será o domínio final para produção? (Importante para configurar Auth do Supabase).

## 📝 Notas Adicionais
- (Espaço para anotações durante a reunião)
