# Documentação Completa do Projeto - WTech SaaS

Este documento fornece uma visão geral detalhada de todas as funcionalidades implementadas, a arquitetura do projeto e o estado atual do desenvolvimento.

## 🛠️ Stack Tecnológica

O projeto utiliza as tecnologias mais recentes do ecossistema React/Next.js:

- **Frontend:** Next.js 16.1.4 (App Router)
- **Linguagem:** TypeScript 5
- **Estilização:** Tailwind CSS 4, Shadcn UI (Radix Primitives)
- **State/Forms:** React Hook Form, Zod
- **Backend/BaaS:** Supabase (Postgres, Auth, Storage, Realtime)
- **PDF:** @react-pdf/renderer para geração de documentos
- **Ícones:** Lucide React

---

## 📂 Estrutura de Diretórios Principais

- **`src/app/`**: Rotas da aplicação (App Router).
    - **`(auth)/`**: Rotas de autenticação (`login`, `signup`).
    - **`dashboard/`**: Painel administrativo principal.
        - `orders/`: Gestão de Ordens de Serviço.
        - `customers/`: Gestão de Clientes.
        - `metrics/`: Métricas e relatórios.
        - `settings/`: Configurações da loja/tenant.
    - **`os/[id]/`**: Área pública para o cliente acompanhar e aprovar serviços.
    - **`api/`**: Rotas de API (Backend logic quando necessário).
- **`scripts/`**: Scripts SQL e utilitários de banco de dados.
    - `schema.sql`: Definição do banco de dados.
    - `seed.sql`: Dados iniciais para testes.
    - `optimize_db.sql`: Índices e otimizações de performance.
    - `fix_security_definer.sql`: Correções de segurança (RLS bypass controlada).
    - `update_smart_ids.sql`: Lógica para IDs amigáveis (Ex: 2024-WT-001).

---

## 🚀 Funcionalidades Implementadas

### 1. Autenticação e Multi-Tenancy
- **Login e Cadastro Seguro:** Autenticação via Email/Senha gerenciada pelo Supabase Auth.
- **Isolamento de Dados (Tenancy):**
    - Todo dado é "Row Level Security" (RLS) protegido.
    - Cada loja (tenant) só vê seus próprios clientes, ordens e configurações.
- **Onboarding:** Detecção de primeira configuração da loja (wizard inicial).

### 2. Gestão de Ordens de Serviço (Dashboard)
- **Listagem Avançada:** Tabela com busca, paginação e filtros por status.
- **Criação de OS:**
    - Cadastro rápido de cliente (modal ou seleção).
    - Cadastro de equipamento (Marca, Modelo, IMEI, Senha).
    - Relato do defeito e checklists de entrada.
- **Smart IDs:** Geração automática de IDs sequenciais e legíveis por loja (`ANO-PREFIXO-SEQUENCIA`).
- **Workflow de Status:**
    - Controle de transição de estados (Aberto -> Orçamento -> Aprovado -> Em Execução -> Pronto -> Entregue).
    - Validações de bloqueio (ex: não pode entregar sem pagamento/aprovação).

### 3. Execução Técnica
- **Checklists de Entrada e Saída:**
    - Obrigatório marcar itens testados (Áudio, Tela, Bateria, etc.).
    - Presets salvos no banco para agilidade.
- **Evidências:** Upload de fotos do aparelho na entrada e saída (Supabase Storage).
- **Orçamento Técnico:**
    - Inserção de laudo técnico.
    - Adição de peças e serviços com valores.
    - Links para compra de peças externas (para controle interno).

### 4. Área do Cliente (Pública)
- **Link de Acompanhamento:** Cliente acessa `wtech.app/os/UUID-DA-OS`.
- **Aprovação Digital:**
    - Cliente visualiza o orçamento completo (PDF na tela).
    - **Assinatura Digital:** Canvas para assinatura na tela do celular/pc.
    - Registro de IP e Data/Hora da aprovação.
- **Tracking (Tipo iFood):** Timeline visual mostrando o progresso do reparo em tempo real.

### 5. Documentos e Impressão
- **Geração de PDF:**
    - Recibos de Entrada.
    - Termos de Garantia (90 dias).
    - Orçamentos detalhados.
- **Personalização:** PDFs gerados com o Logo e Dados da Loja (Tenant) dinamicamente.

### 6. Configurações da Loja
- **Perfil:** Edição de Nome, CNPJ, Endereço e Telefone (Reflete nos impressos).
- **Branding:** Upload de Logomarca.
- **Financeiro:** Configuração básica de Chave PIX (preparação para módulo financeiro).

---

## 💾 Banco de Dados (Postgres)

O banco de dados utiliza recursos avançados do PostgreSQL:
- **Triggers & Functions:** Para atualização automática de timestamps (`updated_at`), geração de IDs sequenciais seguros contra concorrência e auditoria.
- **RLS (Row Level Security):** Segurança a nível de linha forçando `tenant_id` em todas as queries.
- **Índices:** Otimização para buscas por texto, status e chaves estrangeiras (`optimize_db.sql`).

## 📊 Status de Desenvolvimento

- **[Completo]** Estrutura Core (Auth, Tenancy, CRUD OS).
- **[Completo]** Fluxo de Aprovação do Cliente.
- **[Completo]** Geração de PDFs.
- **[Completo/Polimento]** Interface do Técnico (Checklists).
- **[Pendente]** Módulo Financeiro Completo (Contas a pagar/receber, Fluxo de Caixa).
- **[Pendente]** Integração via WhatsApp (API).
