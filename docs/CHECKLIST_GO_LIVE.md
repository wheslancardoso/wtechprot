# 🚀 WTECH - CHECKLIST GO-LIVE

**Data:** 26/01/2026  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA PRODUÇÃO

---

## 📋 VERIFICAÇÕES PRÉ-DEPLOY

### 1. SEGURANÇA (Row Level Security)

| Tabela | RLS Ativo | Política |
|--------|-----------|----------|
| `orders` | ✅ | Apenas autenticados |
| `customers` | ✅ | Apenas autenticados |
| `equipments` | ✅ | Apenas autenticados |
| `order_items` | ✅ | Apenas autenticados |
| `order_logs` | ✅ | Leitura + Insert (imutável) |
| `tenant_settings` | ✅ | Apenas próprio user_id |

### 2. STORAGE (Buckets)

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `os-evidence` | ✅ Público | ✅ Auth | ❌ Bloqueado | ❌ Bloqueado |
| `company-assets` | ✅ Público | ✅ Auth | ✅ Auth | ❌ Bloqueado |

### 3. PERFORMANCE

| Item | Status | Notas |
|------|--------|-------|
| Índices SQL | ✅ | status, created_at, customer_id |
| Next/Image | ⚠️ | Verificar uso em logos |
| PDF Client-Side | ✅ | @react-pdf/renderer é client |

### 4. UX/UI

| Item | Status |
|------|--------|
| Toast Notifications | ✅ Criado |
| Empty States | ✅ Em customers e orders |
| Loading States | ✅ Spinner em todas as páginas |
| Erro Handling | ✅ Try/catch em actions |

---

## 📜 SCRIPTS SQL (Executar em ordem)

```bash
# No Supabase SQL Editor:

1. scripts/sprint_audit_log.sql      # Timeline OS
2. scripts/sprint_settings.sql       # Configurações  
3. scripts/sprint_signature.sql      # Assinatura Digital
4. scripts/production_hardening.sql  # RLS + Índices
```

---

## 🪣 BUCKETS STORAGE (Criar no Supabase)

### os-evidence
```
- Tipo: Público
- Políticas:
  - SELECT: true (qualquer um)
  - INSERT: auth.role() = 'authenticated'
  - UPDATE: false
  - DELETE: false
```

### company-assets
```
- Tipo: Público
- Políticas:
  - SELECT: true
  - INSERT: auth.role() = 'authenticated'
  - UPDATE: auth.role() = 'authenticated'
  - DELETE: false
```

---

## 🧪 TESTES FINAIS

### Fluxo Completo
- [ ] Login no sistema
- [ ] Acessar Configurações e preencher dados
- [ ] Criar nova OS
- [ ] Fazer upload de foto
- [ ] Atualizar status (verificar Timeline)
- [ ] Finalizar OS
- [ ] Baixar PDF de Garantia
- [ ] Verificar dados da loja no PDF

### Segurança
- [ ] Tentar acessar /dashboard sem login (deve redirecionar)
- [ ] Verificar RLS no banco (query direta deve filtrar)

### Performance
- [ ] Lighthouse score > 80
- [ ] Tempo de carregamento < 3s

---

## 📦 FEATURES IMPLEMENTADAS (8 Sprints)

| Sprint | Feature | Status |
|--------|---------|--------|
| 1 | Gestão de OS + Evidências | ✅ |
| 2 | Métricas + Compra Assistida | ✅ |
| 3 | Timeline + PDF Garantia | ✅ |
| 4 | Timezone + Busca/Filtros | ✅ |
| 5 | CRM + Histórico Cliente | ✅ |
| 6 | Configurações + Super MEI | ✅ |
| 7 | Integração + Onboarding | ✅ |
| 8 | Blindagem + WhatsApp + LGPD | ✅ |

---

## 🔐 VARIÁVEIS DE AMBIENTE

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

---

## 🚀 DEPLOY VERCEL

```bash
# Build de produção
npm run build

# Deploy
vercel --prod
```

### Configurações Vercel
- Framework: Next.js
- Node.js: 20.x
- Region: São Paulo (gru1)

---

## 📊 MONITORAMENTO PÓS-DEPLOY

1. **Supabase Dashboard** - Verificar queries e erros
2. **Vercel Analytics** - Performance e Core Web Vitals
3. **Logs** - `vercel logs --follow`

---

## ⚖️ COMPLIANCE

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| LGPD | ✅ | Anonimização implementada |
| Lei 14.063/2020 | ✅ | Assinatura com IP/Hash |
| CDC Art. 18 | ✅ | Termo de peça externa |
| Super MEI | ✅ | Limite configurável |

---

## 📞 SUPORTE

Em caso de problemas:
1. Verificar logs do Vercel
2. Consultar Supabase Dashboard
3. Revisar RLS policies

---

**🎉 SISTEMA PRONTO PARA GO-LIVE!**

*Última atualização: 26/01/2026 23:10*
