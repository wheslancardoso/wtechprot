# 🚀 WTECH - Checklist 3: Sprint Timeline + PDF

**Data:** 26/01/2026  
**Sprint:** Audit Log (Timeline) + Geração de Documentos PDF

---

## 📋 OBJETIVO DO SPRINT

1. **Auditoria Imutável** - Trilha de logs para validade jurídica
2. **Timezone Correto** - Horário de Brasília (America/Sao_Paulo)
3. **Termo de Garantia PDF** - Documento formal para entrega

---

## ✅ IMPLEMENTADO

### 📝 1. Tabela de Auditoria (order_logs)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `order_id` | UUID | FK para orders |
| `previous_status` | TEXT | Status anterior |
| `new_status` | TEXT | Novo status |
| `changed_by` | UUID | Quem fez a alteração |
| `changed_by_type` | TEXT | technician/customer/system |
| `metadata` | JSONB | Dados extras |
| `created_at` | TIMESTAMPTZ | Timestamp em UTC |

### 🔄 2. Trigger Automático

```sql
-- Toda mudança de status é logada automaticamente
CREATE TRIGGER trg_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_order_status_change();
```

### 🕐 3. Timeline Corrigida

- [x] Componente `order-timeline.tsx` lê de `order_logs`
- [x] Formatação: "DD/MM/YYYY às HH:MM" (Brasília)
- [x] Destaque visual para tempo em "Aguardando Peças"
- [x] Ícones e cores por status

### 📄 4. Geração de PDF

- [x] Componente `warranty-pdf.tsx` com React PDF
- [x] Termo de Garantia 90 dias (mão de obra)
- [x] Aviso sobre peças externas (CDC Art. 18)
- [x] Hash de verificação (integridade)
- [x] Fotos de checkout (máx. 4)

---

## ⏳ PENDENTE: SUPABASE

### Executar Migration
```
scripts/sprint_audit_log.sql
```

**Conteúdo:**
- Tabela `order_logs`
- Trigger `trg_order_status_change`
- Função `fn_log_order_status_change()`
- View `v_order_timeline`
- RLS policies
- Seed para OS existentes

---

## 📦 ARQUIVOS CRIADOS

### Backend
| Arquivo | Descrição |
|---------|-----------|
| `scripts/sprint_audit_log.sql` | Migration completa |
| `[id]/timeline-actions.ts` | Server actions para logs |

### Frontend
| Arquivo | Descrição |
|---------|-----------|
| `[id]/order-timeline.tsx` | Timeline dinâmica |
| `components/warranty-pdf.tsx` | Gerador de PDF |
| `[id]/pdf-button-wrapper.tsx` | Wrapper para dynamic import |

---

## 📦 DEPENDÊNCIAS INSTALADAS

```bash
npm install @react-pdf/renderer date-fns date-fns-tz
```

---

## 🧪 TESTES PÓS-DEPLOY

### Timeline
- [ ] Executar migration `sprint_audit_log.sql`
- [ ] Alterar status de uma OS
- [ ] Verificar se evento aparece na Timeline
- [ ] Confirmar formato de data (DD/MM/YYYY às HH:MM)

### PDF
- [ ] Acessar OS finalizada
- [ ] Clicar em "Baixar Termo de Garantia"
- [ ] Verificar conteúdo do PDF
- [ ] Confirmar fotos de checkout no documento

---

## 📊 IMPACTO

| Área | Benefício |
|------|-----------|
| **Jurídico** | Trilha de auditoria imutável com timestamps |
| **LGPD** | Registro de quem fez o quê e quando |
| **Operacional** | Visualização clara do tempo de espera |
| **Profissionalismo** | PDF formal com fotos e hash |

---

## 🔄 PRÓXIMO SPRINT SUGERIDO

1. **Filtros na Lista de OS** - Por status, data, cliente
2. **Busca** - Por CPF, nome ou número
3. **Menu Lateral** - Link para métricas
4. **Notificações** - Webhook para status change

---

*Última atualização: 26/01/2026 18:20*
