# 🧠 Funcionalidades de IA - WTechApp

Este documento detalha o funcionamento, arquitetura e lógica por trás das funcionalidades de Inteligência Artificial implementadas no WTechApp.

O sistema utiliza a API da OpenAI (modelo `gpt-4o`) para atuar em duas frentes principais: **Engenharia de Laudos Técnicos** e **Motor de Orçamentos**.

---

## 1. Módulos de IA

### A. Engenheiro Chefe (Geração de Laudos)
**Objetivo**: Transformar anotações informais do técnico em um documento oficial, técnico e profissional.

*   **Arquivo**: `src/app/actions/generate-technical-report.ts`
*   **Prompt**: Atua como "Engenheiro Chefe".
*   **Temperatura**: `0` (Máxima consistência, sem criatividade aleatória).
*   **Entrada**: 
    *   Descrição do problema (relato do cliente/técnico).
    *   Dados do equipamento.
*   **Saída**: Texto plano com estrutura imutável:
    1.  **ANÁLISE INICIAL & SINTOMAS**
    2.  **DIAGNÓSTICO TÉCNICO**
    3.  **METODOLOGIA DE REPARO APLICADA / PROPOSTA**
    4.  **CONCLUSÃO E RECOMENDAÇÕES**
*   **Regras**: Proibido uso de Markdown; uso obrigatório de linguagem formal e impessoal.

### B. Motor de Orçamentos (Precificação Inteligente)
**Objetivo**: Identificar o serviço no catálogo, sugerir o preço correto baseada no valor do equipamento e gerar a justificativa comercial.

*   **Arquivo**: `src/app/actions/generate-budget.ts`
*   **Prompt**: Atua como "Motor de Orçamentos".
*   **Temperatura**: `0`.
*   **Entrada**:
    *   Descrição do problema.
    *   Contexto do equipamento (Marca, Modelo, Valor estimado).
    *   Catálogo de Serviços (JSON com preços min, max e médio).
*   **Saída**: JSON estruturado:
    ```json
    {
      "service_id": "uuid",
      "suggested_price": 150.00,
      "commercial_description": "Texto formatado...",
      "difficulty_reasoning": "Justificativa..."
    }
    ```

---

## 2. Lógica de Precificação (Budget Engine)

A IA não "inventa" preços. Ela segue estritamente as regras de negócio baseadas no **Valor do Equipamento**:

| Valor do Equipamento | Regra de Preço | Exceções |
| :--- | :--- | :--- |
| **> R$ 5.000** (High-End) | `price_max` | Aplica o teto da tabela para cobrir responsabilidade técnica. |
| **< R$ 2.000** (Entry-Level) | `price_min` | Aplica o piso para viabilizar o reparo. |
| **R$ 2k - 5k** (Médio) | `price_avg` | Preço médio de mercado. |

**Regra Especial:** Serviços de **Limpeza** ou **Formatação** tendem ao preço médio, exceto se o equipamento for explicitamente de luxo (ex: Macbook, Notebook Gamer), onde o risco eleva o preço para `price_max`.

---

## 3. Integração com Whatsapp

Facilitamos o envio do laudo técnico diretamente para o cliente via WhatsApp Web/App.

*   **Onde**: Aba "Laudo Técnico" -> Botão "Enviar via WhatsApp".
*   **Como funciona**:
    1.  O sistema captura o telefone do cadastro do cliente.
    2.  Gera um link público único da OS (`/os/{id}`).
    3.  Monta uma mensagem profissional (agora sem emojis para compatibilidade total).
    4.  Abre a API do WhatsApp (`wa.me`) com tudo preenchido.

**Modelo da Mensagem:**
> Olá, *[Nome do Cliente]*!
> Seu equipamento já foi analisado.
> Confira o Laudo Técnico com o diagnóstico e as fotos do serviço no link seguro abaixo:
> [Link da OS]
>
> Att, Equipe [Nome da Loja].

---

## 4. Fluxo de Uso Recomendado

1.  **Recepção**: Atendente cadastra a OS e preenche o "Relato do Cliente".
2.  **Técnico**:
    *   Analisa o equipamento.
    *   No campo de "Análise/Diagnóstico", digita suas notas rápidas (ex: "tava sujo, limpei, troquei pasta, testei memoria").
    *   Clica em **"Refinar Análise com IA"**.
    *   A IA reescreve tudo em formato de laudo oficial.
3.  **Orçamento**:
    *   Técnico clica em **"Sugerir Orçamento com IA"**.
    *   IA seleciona o serviço no catálogo e define o preço baseado no equipamento.
    *   Sistema preenche automaticamente o valor de Mão de Obra e a Descrição Comercial.
4.  **Entrega**:
    *   Técnico clica em **"Enviar via WhatsApp"** para notificar o cliente com o laudo pronto.

---
*Documentação gerada automaticamente pela equipe de desenvolvimento WTechApp.*
