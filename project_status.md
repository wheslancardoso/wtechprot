# Documentação do Projeto - WTech SaaS

Esta documentação detalha todas as funcionalidades implementadas, módulos ativos e estrutura do banco de dados do projeto até o momento.

## 📦 Visão Geral
O sistema é um SaaS para gestão de assistências técnicas, focado em **Ordens de Serviço (OS)**, com fluxos de aprovação pelo cliente, checklist de execução para técnicos e geração de documentos (PDF).

## 🚀 Módulos e Funcionalidades

### 1. Autenticação & Multi-tenant (Supabase)
- **Login/Cadastro:** Fluxo completo via Email/Senha.
- **Isolamento de Dados:** Row Level Security (RLS) garante que cada loja (tenant) acesse apenas seus dados.
- **Onboarding:** Detecção de cadastro incompleto com alerta persistente até preenchimento das configurações da loja.

### 2. Gestão de Ordens de Serviço (Dashboard)
- **Smart IDs:** OS geradas com formato humanizável `ANO-PREFIX-SEQUENCIA` (ex: `2025-WT-0042`), garantindo concorrência segura.
- **Listagem & Filtros:** Busca por Nome, ID, Status e Data.
- **Detalhes da OS:**
    - **Timeline:** Histórico visual de mudanças de status.
    - **Status Workflow:** Fluxo bloqueante (ex: Só aprova se tiver orçamento).
    - **Upload de Evidências:** Fotos de entrada/saída (Upload direto para Supabase Storage).
    - **Orçamento Técnico:** Modal para inserir diagnóstico, custo de mão de obra e peças externas (links de compra).

### 3. Área do Técnico (Checklists)
- **Checklist de Execução:** Lista de verificação obrigatória para testes de entrada e saída.
- **Presets:** Itens pré-configurados (Audio, Câmera, Tela, Bateria) salvos no banco.
- **Validação:** Impede conclusão sem marcar itens obrigatórios.

### 4. Área do Cliente (Pública)
- **Aprovação Digital:** Link público compartilhável (`/os/[id]`) onde o cliente visualiza o orçamento.
- **Assinatura Digital:** Cliente assina na tela (Canvas) para aprovar o serviço.
- **Rastreamento em Tempo Real:** Tela de acompanhamento (`/os/[id]/track`) estilo "iFood" para ver em que etapa o reparo está.
- **Compra Assistida:** Links para o cliente comprar peças externas.

### 5. Configurações da Loja
- **Perfil da Loja:** Edição de Nome Fantasia, CNPJ, Endereço e Contato (Reflete nos PDFs).
- **Logo:** Upload e armazenamento da logomarca da assistência.
- **Financeiro (Parcial):** Interface para definir Chave Pix e Limite MEI (backend pendente para persistência desses campos específicos).

### 6. Documentos & PDFs
- **Termo de Garantia / Recibo:** Geração automática de PDF (A4) com:
    - Dados da Loja (Reais).
    - Dados do Cliente e Aparelho.
    - Diagnóstico e Valores.
    - Termos Jurídicos (90 dias garantia mão de obra).
    - Assinatura do Cliente (se houver).
- **Fluxo de Impressão:** Disponível tanto na tela de detalhes quanto no modal de finalização de OS.

## 💾 Estrutura do Banco de Dados

### Tabelas Principais
| Tabela | Descrição |
| :--- | :--- |
| `tenants` | Configurações da loja (Nome, CNPJ, Logo, Prefixo OS). |
| `customers` | Cadastro de clientes (Nome, Telefone, Doc). |
| `orders` | Tabela central da OS (Status, IDs, Valores, Datas). |
| `equipments` | Dados do aparelho (Marca, Modelo, IMEI, Senha). |
| `order_items` | Peças e serviços atrelados à OS. |

### Tabelas de Apoio
| Tabela | Descrição |
| :--- | :--- |
| `execution_checklists` | Itens testados pelo técnico (Entrada/Saída). |
| `signatures` | Assinaturas digitais dos clientes (Base64/URL). |
| `order_logs` | Auditoria de mudanças de status e ações. |
| `execution_presets` | Modelos de checklist (ex: Celular, Notebook). |

## 🛠️ Stack Tecnológica
- **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS, Shadcn UI.
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime).
- **PDF:** `@react-pdf/renderer`.
- **Validação:** Zod + React Hook Form.

## ⚠️ Pontos de Atenção / Próximos Passos
- **Módulo Financeiro:** Persistência das chaves Pix na tabela `tenants`.
- **WhatsApp:** Integração ou templates de mensagens.
- **Relatórios:** Dashboards analíticos com dados reais.
