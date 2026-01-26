# 🚀 WTECH - Checklist de Implementação

**Data:** 26/01/2026  
**Status:** PIVOT para Compra Assistida

---

## ✅ O QUE JÁ FOI FEITO

### 🗄️ Backend / Server Actions
- [x] `createOrder` - Criar nova OS
- [x] `updateOrderStatus` - Atualizar status
- [x] `saveBudget` - Salvar orçamento com peças externas
- [x] `approveBudget` - Cliente aprova (com assinatura digital)
- [x] `rejectBudget` - Cliente reprova
- [x] `confirmPartArrival` - Confirmar chegada da peça
- [x] `finishOrderWithPayment` - Finalizar OS com pagamento manual
- [x] `createAdminClient` - Cliente Supabase com bypass RLS

### 🎨 Frontend - Área do Técnico
- [x] Lista de OS (`/dashboard/orders`)
- [x] Criar nova OS (`/dashboard/orders/new`)
- [x] Detalhes da OS (`/dashboard/orders/[id]`)
- [x] `order-actions.tsx` - Máquina de estados
- [x] `budget-modal.tsx` - Modal de orçamento com peças externas
- [x] `finish-order-modal.tsx` - Modal de finalização com pagamento

### 👤 Frontend - Área do Cliente
- [x] Página pública (`/os/[id]`)
- [x] `client-actions.tsx` - Aprovar/Reprovar com checkbox de termos
- [x] Captura de assinatura digital (IP, userAgent, timestamp)
- [x] Middleware liberando rota `/os/*`

### 📝 Documentação
- [x] `docs/SISTEMA.md` - Documentação geral
- [x] `scripts/update_schema_approval.sql` - Migration approved_at/canceled_at
- [x] `scripts/pivot_compra_assistida.sql` - Migration do pivot

---

## ⏳ O QUE PRECISA SER FEITO AGORA

### 🔥 URGENTE (Banco de Dados)

#### 1. Executar Migrations no Supabase
Acesse: https://supabase.com/dashboard/project/wddebrieixjcxurtggmb/sql

**Executar em ordem:**

```sql
-- 1º: Colunas de aprovação (se ainda não executou)
-- Copiar conteúdo de: scripts/update_schema_approval.sql

-- 2º: Colunas do pivot
-- Copiar conteúdo de: scripts/pivot_compra_assistida.sql
```

### 🔧 CORREÇÕES PENDENTES

#### 2. Verificar componente Select
O modal de pagamento usa `Select` do Shadcn. Verificar se o componente existe:
```
src/components/ui/select.tsx
```

Se não existir, criar ou instalar via:
```bash
docker-compose exec app npx shadcn@latest add select
```

#### 3. Testar Fluxo Completo
Após executar as migrations, testar:

1. **Criar OS** → Status: `open`
2. **Iniciar Diagnóstico** → Status: `analyzing`
3. **Finalizar Diagnóstico** (criar orçamento com peças) → Status: `waiting_approval`
4. **Acessar link público** `/os/[id]`
   - Verificar checkbox de termos
   - Aprovar orçamento → Status: `waiting_parts`
5. **Confirmar Chegada da Peça** → Status: `in_progress`
6. **Finalizar e Registrar Pagamento** → Status: `finished`
   - Verificar recibo gerado

---

## 📋 PRÓXIMAS FUNCIONALIDADES (Backlog)

### Prioridade Alta
- [ ] Dashboard de métricas (OS abertas, faturamento do mês)
- [ ] Filtros na lista de OS (por status, data, cliente)
- [ ] Notificação WhatsApp automática ao cliente

### Prioridade Média
- [ ] Editar dados do cliente
- [ ] Histórico de OS por cliente
- [ ] Galeria de fotos da OS (upload)
- [ ] Busca por CPF/Nome/Número da OS

### Prioridade Baixa
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Multi-tenancy (vários técnicos)
- [ ] Controle de estoque interno (opcional)
- [ ] Integração com impressora térmica

---

## 🐛 BUGS CONHECIDOS

| Bug | Status | Solução |
|-----|--------|---------|
| TypeScript não encontra `finish-order-modal` | 🟡 | Reiniciar TS Server no VS Code |
| Erro SQL `canceled_at not found` | 🔴 | Executar migration |

---

## 📞 COMANDOS ÚTEIS

```bash
# Reiniciar app
docker-compose restart app

# Ver logs
docker-compose logs app -f

# Entrar no container
docker-compose exec app sh

# Instalar componente Shadcn
docker-compose exec app npx shadcn@latest add <componente>
```

---

## 🔗 LINKS IMPORTANTES

- **Supabase Dashboard:** https://supabase.com/dashboard/project/wddebrieixjcxurtggmb
- **SQL Editor:** https://supabase.com/dashboard/project/wddebrieixjcxurtggmb/sql
- **App Local:** http://localhost:3000
- **Página Cliente (teste):** http://localhost:3000/os/[id-da-os]

---

*Última atualização: 26/01/2026 17:44*
