# 🚀 WTECH - Checklist de Implementação

**Data:** 26/01/2026  
**Status:** Sprint Segurança e Gestão

---

## ✅ O QUE JÁ FOI FEITO

### 🗄️ Core - Backend / Server Actions
- [x] `createOrder` - Criar nova OS
- [x] `updateOrderStatus` - Atualizar status
- [x] `saveBudget` - Salvar orçamento com peças externas
- [x] `approveBudget` - Cliente aprova (com assinatura digital)
- [x] `rejectBudget` - Cliente reprova
- [x] `confirmPartArrival` - Confirmar chegada da peça
- [x] `finishOrderWithPayment` - Finalizar OS com pagamento manual
- [x] `createAdminClient` - Cliente Supabase com bypass RLS
- [x] `saveEvidencePhotos` - Salvar fotos de evidência
- [x] `getMonthlyMetrics` - Métricas financeiras MEI Safe

### 🎨 Core - Frontend Técnico
- [x] Lista de OS (`/dashboard/orders`)
- [x] Criar nova OS (`/dashboard/orders/new`)
- [x] Detalhes da OS (`/dashboard/orders/[id]`)
- [x] `order-actions.tsx` - Máquina de estados
- [x] `budget-modal.tsx` - Modal de orçamento com peças externas
- [x] `finish-order-modal.tsx` - Modal de finalização com pagamento

### 👤 Core - Frontend Cliente
- [x] Página pública (`/os/[id]`)
- [x] `client-actions.tsx` - Aprovar/Reprovar com checkbox de termos
- [x] Captura de assinatura digital (IP, userAgent, timestamp)
- [x] Middleware liberando rota `/os/*`

### 📸 Sprint Segurança - Evidências
- [x] `image-upload.tsx` - Componente de upload de imagens
- [x] `evidence-section.tsx` - Seção de evidências na página da OS
- [x] Server action `saveEvidencePhotos`
- [x] Migration SQL com colunas `photos_checkin` e `photos_checkout`

### 📊 Sprint Gestão - Métricas MEI Safe
- [x] Página `/dashboard/metrics`
- [x] Card: Faturamento Real (apenas mão de obra)
- [x] Card: Economia Gerada para Cliente
- [x] Card: Total Recebido
- [x] Card: Ticket Médio
- [x] Barra de progresso do limite MEI
- [x] View SQL `v_current_month_metrics`

### 📱 Sprint Comunicação - WhatsApp
- [x] `whatsapp-button.tsx` - Botão com mensagens automáticas
- [x] Integrado na seção de evidências
- [x] Mensagens personalizadas por status

---

## ⏳ O QUE PRECISA SER FEITO AGORA

### 🔥 URGENTE (Banco de Dados)

#### 1. Executar TODAS as Migrations no Supabase
Acesse: https://supabase.com/dashboard/project/wddebrieixjcxurtggmb/sql

**Executar em ordem:**

```sql
-- 1º: scripts/update_schema_approval.sql
-- 2º: scripts/pivot_compra_assistida.sql
-- 3º: scripts/sprint_evidencias_metricas.sql ← NOVO!
```

#### 2. Criar Bucket no Supabase Storage
1. Acesse: Supabase Dashboard > Storage
2. Clique em "New bucket"
3. Nome: `os-evidence`
4. Marque "Public bucket"
5. Salve

#### 3. Criar Policies do Storage
```sql
-- No SQL Editor, execute:

-- Policy para upload (apenas autenticados)
CREATE POLICY "Authenticated can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'os-evidence' AND auth.role() = 'authenticated');

-- Policy para visualizar (todos)
CREATE POLICY "Public can view evidence"
ON storage.objects FOR SELECT
USING (bucket_id = 'os-evidence');

-- Policy para deletar (apenas autenticados)
CREATE POLICY "Authenticated can delete evidence"
ON storage.objects FOR DELETE
USING (bucket_id = 'os-evidence' AND auth.role() = 'authenticated');
```

### 🔧 DEPENDÊNCIAS

O pacote `@radix-ui/react-progress` já foi instalado. Se houver erro:
```bash
docker-compose exec app npm install @radix-ui/react-progress
```

---

## 📋 ARQUIVOS CRIADOS NESTE SPRINT

| Arquivo | Descrição |
|---------|-----------|
| `scripts/sprint_evidencias_metricas.sql` | Migration para fotos e views |
| `src/components/image-upload.tsx` | Componente de upload |
| `src/components/whatsapp-button.tsx` | Botão WhatsApp |
| `src/components/ui/progress.tsx` | Barra de progresso |
| `src/app/dashboard/metrics/page.tsx` | Dashboard financeiro |
| `src/app/dashboard/orders/[id]/evidence-section.tsx` | Seção de evidências |

---

## 🧪 TESTAR APÓS MIGRATIONS

1. **Upload de Fotos (Check-in)**
   - Abrir OS com status `open` ou `analyzing`
   - Subir fotos na seção "Evidências"
   - Clicar "Salvar Fotos de Entrada"

2. **Dashboard Financeiro**
   - Acessar `/dashboard/metrics`
   - Verificar se faturamento mostra apenas mão de obra
   - Verificar barra de progresso MEI

3. **WhatsApp**
   - Clicar no botão "Enviar Orçamento"
   - Verificar se abre WhatsApp com mensagem formatada

---

## 📋 PRÓXIMAS FUNCIONALIDADES (Backlog)

### Prioridade Alta
- [ ] Filtros na lista de OS (por status, data, cliente)
- [ ] Busca por CPF/Nome/Número da OS
- [ ] Link para métricas no menu lateral

### Prioridade Média
- [ ] Editar dados do cliente
- [ ] Histórico de OS por cliente
- [ ] Notificação automática no status change

### Prioridade Baixa
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Multi-tenancy (vários técnicos)
- [ ] Controle de estoque interno

---

## 🔗 LINKS IMPORTANTES

- **Supabase Dashboard:** https://supabase.com/dashboard/project/wddebrieixjcxurtggmb
- **SQL Editor:** https://supabase.com/dashboard/project/wddebrieixjcxurtggmb/sql
- **Storage:** https://supabase.com/dashboard/project/wddebrieixjcxurtggmb/storage
- **App Local:** http://localhost:3000
- **Métricas:** http://localhost:3000/dashboard/metrics

---

*Última atualização: 26/01/2026 17:50*
