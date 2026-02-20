# Documentação Completa do Projeto - Plataforma WTech SaaS

Este documento fornece uma visão geral detalhada de todas as funcionalidades implementadas, a arquitetura do projeto e o estado atual do desenvolvimento. Foi desenvolvido para elevar a profissionalização da gestão técnica, focando em continuidade e performance operacional.

## 🛠️ Stack Tecnológica

O projeto utiliza as tecnologias mais recentes do ecossistema React/Next.js:

- **Frontend:** Next.js 16.1.4 (App Router)
- **Linguagem:** TypeScript 5
- **Estilização:** Tailwind CSS 4, Shadcn UI (Radix Primitives)
- **State/Forms:** React Hook Form, Zod
- **Backend/BaaS:** Supabase (Postgres, Auth, Storage, Realtime)
- **PDF:** `@react-pdf/renderer` para geração de documentos
- **Ícones:** Lucide React
- **Analytics e Rastreio:** Google Tag Manager / Telemetria Customizada

---

## 📂 Estrutura de Diretórios Principais

- **`src/app/`**: Rotas da aplicação (App Router).
    - **`(auth)/`**: Rotas de autenticação (`login`, `signup`).
    - **`dashboard/`**: Painel gerencial e administrativo principal.
        - `orders/`: Gestão de Ordens de Serviço (Soluções Técnicas e Ajustes de Performance).
        - `customers/`: Banco de Dados de Clientes.
        - `agenda/`: Calendário e controle dinâmico da fila de trabalho.
        - `leads/`: Captação e gestão de novas oportunidades.
        - `follow-ups/`: Gestão de Relacionamento, verificações pontuais Pós-Serviço.
        - `feedbacks/`: Avaliações e controle de percepção do cliente.
        - `services/`: Portfólio de soluções padronizadas.
        - `metrics/`: Dashboards analíticos e indicadores de desempenho.
        - `settings/`: Configurações globais da organização parceira (Tenant).
    - **`os/[id]/`**: Portal de visibilidade pública para o cliente analisar e endossar as propostas.
    - **`(b2b)/` e `consultoria-para-empresas/`**: Estrutura orientada à captação de clientes corporativos (Contratos B2B).
    - **`api/`**: APIs dedicadas para consumo interno.
- **`src/components/`**: Módulos de interface reutilizáveis (Laudos, Checklists de Validação, Documentos de Garantia, Tracking de Performance, Componentes de Captação e Engajamento).
- **`scripts/`**: Rotinas em SQL para integridade e evolução do schema de dados.

---

## 🚀 Funcionalidades Implementadas

### 1. Governança e Acessos (Multi-Tenancy)
- **Acesso Seguro:** Fluxo de autenticação completo (Supabase Auth).
- **Isolamento de Dados Elevado:**
    - Políticas estritas de Row Level Security (RLS) no PostgreSQL.
    - Cada organização isola inteiramente seus clientes, equipamentos e registros.
- **Onboarding:** Fluxo automatizado de configuração da nova organização.

### 2. Gestão de Operações (Ordem de Serviço)
- **Controle Total:** Listagem com pesquisa eficiente, paginação e uso de filtros por estágio de evolução.
- **Ingresso e Triagem Rápidos:**
    - Criação ou vínculo otimizado de clientes.
    - Detalhamento avançado de cada Equipamento e Estação Móvel (Modelos, Seriais/IMEIs, Credenciais).
    - Relato sintomático do cliente e execução de *Checklist* de entrada.
- **Numeração Inteligente (Smart IDs):** Geração customizada e livre de falhas (Ex: `2024-WT-001`).
- **Pipelines Visuais:**
    - Tráfego de status governado por lógica de negócio (Entrada -> Avaliação -> Aprovação -> Execução -> Qualidade -> Encerramento).
    - Bloqueios anti-falha (ex: travamento na entrega sem devido aval e liquidação).
- **Audit e Activity Feed:** Linha do tempo de todas as interações e atualizações geradas em cada entrada, registrando autoria e horário precisos.

### 3. Engenharia de Laboratório (Execução)
- **Checklists Modulares (Entrada e Saída):**
    - Protocolo de revisão cobrindo áudio, substituição de display/painéis, conectividade, etc.
    - Modelos pré-configurados para evitar retrabalho na verificação de integridade.
- **Documentação por Evidências Visuais:** Upload direto e seguro associando imagens antes e depois das intervenções de melhoria.
- **Elaboração de Propostas e Avaliação Técnica:**
    - Registro do Laudo Técnico completo demonstrando cenários de ajuste de performance ou manutenção preventiva.
    - Cotação subdividida em serviços e adição de componentes/hardware essenciais.
    - Vínculos diretos simplificando a aquisição paralela de suprimentos via Supply Chain externo.

### 4. Portal do Cliente (Jornada Transparente)
- **Link Criptografado de Status:** Endpoint seguro (`/os/UUID`) destinado ao usuário final.
- **Aprovação Documental Digital:**
    - Apresentação impecável dos termos de performance e proposta técnica.
    - **Assinatura Eletrônica:** Ponto focal para o cliente assinar via touchscreen ou mouse, referendando o aceite legal.
    - Certificação com dados de IP subjacente, provendo rastro irrevogável.
- **Status via Tracking (Realtime Tracker):** Visão cronológica interativa, informando claramente a evolução e conclusão da manutenção preventiva.
- **Aceleração Via WhatsApp:** Atalhos de compartilhamento ativando o envio unificado do link seguro de rastreio direto ao canal oficial do cliente.

### 5. Documentação Tecnológica Otimizada
- **Geração PDF "On The Fly" (`@react-pdf/renderer`):**
    - Produção dinâmica de Recibos formais.
    - Confecção automática do Termo Técnico de Garantia.
    - Propostas corporativas digitalizadas.
- **Personalização Organizacional:** A injeção automática das fontes de dados, da razão social e logotipo da respectiva organização que emite o documento.

### 6. Relacionamento Contínuo (CRM Embarcado)
- **Gestão de Leads:** Interface especializada para recepcionar e nutrir corporações com interesse em alto volume.
- **Follow-ups Estratégicos:** Escalonamento estruturado de retornos qualitativos (Ex: acionar cliente dias após o envio da estação móvel para checar a aderência e performance do hardware entregue).
- **Quality Assurance (Feedbacks):** Monitoramento sistêmico da nota NPS ou satisfação tangível pós-conclusão.
- **Catálogo Padrão de Soluções:** Precificação referencial e banco unificado de procedimentos homologados.

### 7. Gestão Intranet da Organização (Settings)
- **Dados Corporativos:** Painel de configuração dos registros jurídicos e endereçamentos operacionais.
- **Branding Personalizado:** Upload da marca primária digital da empresa.
- **Bases Fiscais/Financeiras:** Determinação da chave PIX receptora para integração ágil de pagamentos diários.

### 8. Representação Institucional Integrada
- **Ambientes Dedicados (Landing Pages):** Vias como `B2B` e `Consultoria` criadas sob medida na captação online qualificada.
- **Métricas de Engajamento:** Eventos mapeados proativamente despachando índices avançados ao ambiente de Analytics.

---

## 💾 Banco de Dados e Escalabilidade Cloud
- **PostgreSQL de Alta Demanda:**
    - **Serviços Ativos Internos:** Uso de *Triggers* transacionais para rotacionar numerações sem "race conditions".
    - **Blindagem Multilocatária:** As políticas (*Policies*) rigorosas do sistema RLS blindam qualquer operação SELECT/UPDATE/DELETE.
    - **Eficiência Operacional:** Mapeamento via algorítimos *B-Tree* incidentes sobre os termos mais buscados, blindando tempos de resposta.

## 📊 Status Macro de Desenvolvimento

- **[Deploy Integrado]** Framework Core: Autenticação, Defesas Multitenancy, Controle Extremo de Sessão.
- **[Deploy Integrado]** Workflow Operacional: Tratamento de Equipamentos, Checklists e Ordem de Produção Técnica.
- **[Deploy Integrado]** Relacionamentos e Extensões: Feedback e Follow-ups, Clientes, Catálogos e Agendamentos.
- **[Deploy Integrado]** Superfície de Validação Externa: Portal Autônomo para Aprovação e Assinatura Eletrônica de Termos por Parte do Cliente.
- **[Aprimoramento]** Painéis Analíticos (Metrics) e Funil de Retenção Ativa.
- **[Roadmap/Pendente]** Automação Fiscal e Suíte Financeira Integralizando DRE.
- **[Roadmap/Pendente]** Interoperabilidade e Disparos por Mensageria Global (API Meta / WhatsApp Platform).
