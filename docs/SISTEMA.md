# WTECH SaaS - Documentação do Sistema de OS

## 📋 Visão Geral

Sistema de gestão de Ordens de Serviço (OS) para assistência técnica, com foco no modelo **Compra Assistida** onde o cliente é responsável por comprar as peças indicadas pelo técnico.

---

## 🏗️ Arquitetura do Projeto

```
wtech-saas/
├── src/
│   ├── app/
│   │   ├── dashboard/orders/          # Área do Técnico (autenticada)
│   │   │   ├── page.tsx               # Lista de OS
│   │   │   ├── actions.ts             # Server Actions (CRUD)
│   │   │   ├── new/page.tsx           # Criar nova OS
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Detalhes da OS
│   │   │       ├── order-actions.tsx  # Botões de ação (máquina de estados)
│   │   │       └── budget-modal.tsx   # Modal de orçamento
│   │   │
│   │   ├── os/[id]/                   # Área do Cliente (pública)
│   │   │   ├── page.tsx               # Visualização do orçamento
│   │   │   ├── client-actions.tsx     # Botões aprovar/reprovar
│   │   │   └── actions.ts             # Server Actions (aprovar/reprovar)
│   │   │
│   │   └── login/                     # Autenticação
│   │
│   ├── components/ui/                 # Componentes Shadcn UI
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── table.tsx
│   │
│   ├── lib/supabase/
│   │   └── server.ts                  # Cliente Supabase (normal + admin)
│   │
│   ├── middleware.ts                  # Proteção de rotas
│   │
│   └── types/
│       └── database.ts                # Tipos TypeScript do banco
│
├── scripts/
│   ├── schema.sql                     # Schema inicial do banco
│   ├── seed.sql                       # Dados de teste
│   └── update_schema_approval.sql     # Migration para approved_at/canceled_at
│
└── docker-compose.yml                 # Ambiente de desenvolvimento
```

---

## 🔄 Fluxo de Estados da OS

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│    OPEN     │ ──> │  ANALYZING  │ ──> │ WAITING_APPROVAL │
│ (OS Aberta) │     │ (Diagnóstico)│    │ (Aguardando      │
└─────────────┘     └─────────────┘     │  Cliente)        │
      │                   │             └────────┬─────────┘
      │                   │                      │
      ▼                   ▼                      │
┌─────────────┐     ┌─────────────┐     ┌───────┴───────────────────────┐
│  CANCELED   │ <── │  CANCELED   │ <── │                               │
│ (Cancelada) │     │             │     │  Cliente escolhe:             │
└─────────────┘     └─────────────┘     │                               │
                                        │  ┌─────────┐   ┌────────────┐ │
                                        │  │ APROVAR │   │  REPROVAR  │ │
                                        │  └────┬────┘   └─────┬──────┘ │
                                        │       │              │        │
                                        └───────┼──────────────┼────────┘
                                                │              │
                          ┌─────────────────────┘              │
                          │                                    ▼
                          ▼                            ┌─────────────┐
        ┌─────────────────────────────┐                │  CANCELED   │
        │ Tem peças?                  │                └─────────────┘
        │                             │
        │  SIM              NÃO       │
        │   │                │        │
        │   ▼                ▼        │
        │ WAITING_PARTS  IN_PROGRESS  │
        └─────────────────────────────┘
                  │              │
                  │              │
                  ▼              ▼
           ┌─────────────┐  ┌─────────────┐
           │ IN_PROGRESS │  │  FINISHED   │
           │ (Em reparo) │  │ (Concluído) │
           └──────┬──────┘  └─────────────┘
                  │
                  ▼
           ┌─────────────┐
           │  FINISHED   │
           │ (Concluído) │
           └─────────────┘
```

---

## 📝 Server Actions

### `src/app/dashboard/orders/actions.ts`

| Action | Descrição |
|--------|-----------|
| `createOrder(formData)` | Cria nova OS com cliente (existente ou novo) |
| `updateOrderStatus(orderId, newStatus)` | Atualiza status da OS |
| `saveBudget(orderId, diagnosis, laborCost, parts)` | Salva orçamento técnico |

### `src/app/os/[id]/actions.ts`

| Action | Descrição |
|--------|-----------|
| `approveBudget(orderId)` | Cliente aprova orçamento |
| `rejectBudget(orderId)` | Cliente reprova orçamento |

---

## 🎨 Componentes UI

### `order-actions.tsx` - Máquina de Estados do Técnico

| Status | Ação Disponível |
|--------|-----------------|
| `open` | [▶ Iniciar Diagnóstico] |
| `analyzing` | [📄 Finalizar Diagnóstico] [❌ Cancelar] |
| `waiting_approval` | 🟡 Alert "Aguardando Cliente" (travado) |
| `waiting_parts` | [📦 Peças Chegaram] |
| `in_progress` | [✅ Finalizar Serviço] |
| `ready` | [✅ Entregar ao Cliente] |
| `finished` / `canceled` | Mensagem de conclusão |

### `budget-modal.tsx` - Modal de Orçamento

- **Laudo Técnico** (textarea)
- **Mão de Obra** (input monetário)
- **Peças Externas** (array dinâmico)
  - Nome da peça
  - Link de compra (URL)
- **Tela de Sucesso** com link público e botão WhatsApp

### `client-actions.tsx` - Ações do Cliente

- Exibe status atual
- Botões **Aprovar** / **Reprovar** (apenas se `waiting_approval`)
- Feedback visual para cada status

---

## 🌐 Rotas

### Rotas Protegidas (requer login)

| Rota | Descrição |
|------|-----------|
| `/dashboard/orders` | Lista de todas as OS |
| `/dashboard/orders/new` | Criar nova OS |
| `/dashboard/orders/[id]` | Detalhes da OS |

### Rotas Públicas (sem login)

| Rota | Descrição |
|------|-----------|
| `/os/[id]` | Cliente visualiza orçamento |
| `/login` | Página de login |

---

## 🗄️ Banco de Dados (Supabase)

### Tabela: `orders`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `display_id` | SERIAL | Número sequencial (ex: 0001) |
| `user_id` | UUID | FK para auth.users (técnico) |
| `customer_id` | UUID | FK para customers |
| `device_type` | TEXT | Tipo de equipamento |
| `brand` | TEXT | Marca |
| `model` | TEXT | Modelo |
| `reported_issue` | TEXT | Problema relatado |
| `status` | TEXT | Estado atual da OS |
| `diagnosis_text` | TEXT | Laudo técnico |
| `labor_cost` | DECIMAL | Valor da mão de obra |
| `parts_cost_external` | DECIMAL | Custo peças externas |
| `approved_at` | TIMESTAMP | Data de aprovação |
| `canceled_at` | TIMESTAMP | Data de cancelamento |
| `created_at` | TIMESTAMP | Data de criação |

### Tabela: `customers`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | FK para auth.users |
| `name` | TEXT | Nome do cliente |
| `phone` | TEXT | Telefone |
| `email` | TEXT | Email (opcional) |

### Tabela: `order_items`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `order_id` | UUID | FK para orders |
| `title` | TEXT | Nome do item |
| `type` | TEXT | `service`, `part_internal`, `part_external` |
| `price` | DECIMAL | Valor |
| `external_url` | TEXT | Link de compra (se externo) |

---

## 🔐 Autenticação e Segurança

### Middleware (`src/middleware.ts`)

```typescript
// Rotas públicas (sem autenticação)
if (pathname.startsWith('/os/')) {
  return supabaseResponse // bypass
}

// Rotas protegidas
if (!user && pathname.startsWith('/dashboard')) {
  return redirect('/login')
}
```

### Clientes Supabase

| Função | Uso |
|--------|-----|
| `createClient()` | Rotas autenticadas (respeita RLS) |
| `createAdminClient()` | Rotas públicas (bypass RLS) |

---

## 🐳 Docker

### Comandos

```bash
# Iniciar ambiente
docker-compose up --build

# Ver logs
docker-compose logs app -f

# Instalar pacote npm
docker-compose exec app npm install <pacote>

# Parar ambiente
docker-compose down
```

---

## 📦 Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 15.x | Framework React |
| `@supabase/ssr` | 0.x | Cliente Supabase SSR |
| `@supabase/supabase-js` | 2.x | Cliente Supabase JS |
| `react-hook-form` | 7.x | Gerenciamento de formulários |
| `zod` | 3.x | Validação de schemas |
| `@radix-ui/react-dialog` | 1.x | Componente Dialog |
| `lucide-react` | 0.x | Ícones |
| `tailwindcss` | 4.x | Estilização |

---

## ⚙️ Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ Nunca expor no frontend!
```

---

## 📱 Modelo de Negócio: Compra Assistida

1. **Técnico diagnostica** o problema
2. **Técnico indica peças** com links de compra (Mercado Livre, etc)
3. **Cliente recebe link** via WhatsApp
4. **Cliente compra** as peças e entrega na assistência
5. **Técnico realiza** o reparo
6. **Cliente paga** apenas a mão de obra ao técnico

### Vantagens

- ✅ Técnico não precisa investir em estoque
- ✅ Cliente escolhe onde comprar (melhor preço)
- ✅ Transparência no processo
- ✅ Reduz risco de inadimplência

---

## 🚀 Próximos Passos Sugeridos

1. [ ] Notificações por email/SMS
2. [ ] Dashboard com métricas (OS abertas, faturamento, etc)
3. [ ] Edição de dados do cliente
4. [ ] Histórico de OS por cliente
5. [ ] Impressão de recibo/comprovante
6. [ ] Galeria de fotos da OS
7. [ ] Assinatura digital do cliente
8. [ ] Integração com gateway de pagamento

---

## 📄 Licença

Projeto privado - WTECH Assistência Técnica

---

*Documentação gerada em 26/01/2026*
