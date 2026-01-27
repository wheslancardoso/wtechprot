# 🚀 WTECH - Checklist 6: Sprint Configurações e Identidade

**Data:** 26/01/2026  
**Sprint:** Configurações da Loja + Preparação Super MEI

---

## 📋 OBJETIVO DO SPRINT

1. **Identidade da Loja** - Logo, nome, endereço personalizáveis
2. **Chave Pix** - Configurar para recebimentos
3. **Limite MEI Dinâmico** - Preparado para Super MEI (R$ 140-150k)
4. **Logs de Auditoria** - Conformidade LGPD

---

## ✅ IMPLEMENTADO

### 🏪 1. Tabela tenant_settings

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `trade_name` | TEXT | Nome fantasia |
| `legal_document` | TEXT | CNPJ/CPF |
| `address` | JSONB | Endereço completo |
| `logo_url` | TEXT | URL no Storage |
| `pix_key` | TEXT | Chave Pix |
| `pix_key_type` | TEXT | cpf/cnpj/email/phone/random |
| `mei_limit_annual` | DECIMAL | Teto MEI (default 81000) |
| `mei_limit_monthly` | DECIMAL | Calculado automaticamente |
| `warranty_days_labor` | INTEGER | Garantia mão de obra (default 90) |

### ⚙️ 2. Página de Configurações

**Aba "Minha Loja":**
- Upload de logo (bucket `company-assets`)
- Nome, CNPJ, telefone, e-mail
- Endereço completo

**Aba "Financeiro & Pix":**
- Tipo e chave Pix
- Presets de limite MEI:
  - R$ 81.000 (MEI Atual)
  - R$ 140.000 (Super MEI - PLP 108)
  - R$ 150.000 (Super MEI - PLP 60)
- Campo personalizado

**Aba "Segurança":**
- Últimos 50 logs de `order_logs`
- Data/hora, OS, ação

---

## 📦 ARQUIVOS CRIADOS

| Arquivo | Descrição |
|---------|-----------|
| `scripts/sprint_settings.sql` | Migration tabela + RLS |
| `src/app/dashboard/settings/actions.ts` | Server actions |
| `src/app/dashboard/settings/page.tsx` | Página com 3 tabs |

---

## 🔗 ROTAS CRIADAS

| Rota | Descrição |
|------|-----------|
| `/dashboard/settings` | Configurações da loja |

---

## 🧪 TESTES

### Pré-requisito
- [ ] Executar `scripts/sprint_settings.sql` no Supabase
- [ ] Criar bucket `company-assets` no Storage (público)

### Página de Configurações
- [ ] Acessar `/dashboard/settings`
- [ ] Preencher dados da loja e salvar
- [ ] Fazer upload de logo
- [ ] Configurar chave Pix
- [ ] Selecionar limite MEI personalizado
- [ ] Verificar aba Segurança

---

## 📊 IMPACTO NO NEGÓCIO

| Área | Benefício |
|------|-----------|
| **Identidade** | PDFs com logo da loja |
| **Pagamentos** | Pix configurável |
| **Fiscal** | Preparado para Super MEI 2026 |
| **LGPD** | Logs de auditoria visíveis |

---

## ⚠️ PENDÊNCIAS DE INTEGRAÇÃO

Para completar o ciclo, ainda é necessário:

1. **PDF (warranty-pdf.tsx)** - Usar `logo_url` e `address` das settings
2. **Modal de Finalização** - Mostrar chave Pix das settings
3. **Dashboard Métricas** - Usar `mei_limit_annual` das settings

Essas integrações podem ser feitas no próximo sprint ou sob demanda.

---

## 🔄 PRÓXIMO SPRINT SUGERIDO

1. **Menu Lateral Completo** - Links para todas as páginas
2. **Dashboard Home** - Resumo rápido na entrada
3. **Integrações** - PDF e Modal usando settings
4. **API WhatsApp** - Notificações automáticas

---

*Última atualização: 26/01/2026 22:40*
