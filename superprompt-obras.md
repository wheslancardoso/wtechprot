# Superprompt: Aplicativo Mobile para Profissionais de Obras (Pedreiros e Eletricistas)

**Instruções para a IA geradora (Copie a partir daqui para iniciar um novo chat com uma IA):**

Atue como um Desenvolvedor Mobile Sênior (Especialista em React Native/Expo e Supabase) e um Designer de UX/UI focado em usabilidade e conversão. Seu objetivo é me guiar e gerar todo o código para criar um aplicativo mobile focado em **Profissionais de Obras e Elétrica** (pedreiros, eletricistas, encanadores, pintores etc).

## 🎯 Objetivo e Público-Alvo
O aplicativo será a principal ferramenta de trabalho em campo do profissional. Deve ajudá-lo a abandonar a "prancheta" ou o caderninho de anotações e digitalizar totalmente seu fluxo: desde cadastrar um novo cliente no local, abrir uma Ordem de Serviço, fazer um levantamento de custos (orçamento), gerar um PDF com visual super profissional, e já enviar na hora pelo WhatsApp do cliente.

**Diretrizes de UX/UI (Crucial e Inegociável):**
- O usuário principal frequentemente está com as mãos sujas na obra, usa luvas, estressado, e/ou tem pouco tempo de tela.
- O design precisa ter **alta acessibilidade visual e motora**: inputs enormes, botões de ação (CTAs) em destaque e fáceis de tocar, forte contraste (evite cinza claro com branco), fontes grandes.
- Navegação óbvia: utilize *Bottom Tabs* (Menu inferior). A regra é: qualquer ação principal precisa de no máximo 3 toques para ser finalizada.
- A paleta de cores deve transmitir robustez e confiança. Utilize cores modernas (ex: Amarelo Obra / Laranja Vibrante, combinados com Cinza Asfalto / Preto ou Azul Engenharia / Chumbo). 
- O app deve ter cara de produto "Premium". Use microanimações sutis, feedback vibratório no clique de salvar/excluir (Haptics), e ícones intuitivos (ferramentas, check, pdf).

## 🛠 Tech Stack Sugerida
- **Framework Mobile:** React Native com Expo (com Expo Router para navegação baseada em arquivos).
- **Backend & BaaS:** Supabase (Autenticação, PostgreSQL para os relatórios, e Supabase Storage para salvar fotos do ANTES/DEPOIS).
- **Estilização/UI:** NativeWind (Tailwind CSS adaptado para RN) ou conjunto pronto de UI compatível para rápido desenvolvimento mantendo alto padrão.
- **Roteamento:** Expo Router v3+.
- **Geração de PDF e Share:** `expo-print` (para gerar PDF a partir de templates HTML) e `expo-sharing` (para chamar a folha de compartilhamento/WhatsApp do OS nativo).

## 🧱 Funcionalidades Principais (Escopo do MVP)

1. **Autenticação Descomplicada:**
   - Tela de login limpa (Email/Senha). Considere prever um fluxo para recuperação fácil de senha.

2. **Dashboard (Tela Inicial):**
   - Visão de resumo que dê orgulho: Quantas obras/OS estão "Em Andamento"? Quantos orçamentos fechados (Aprovados) no mês? Faturamento presumido do mês (se os dados existirem).
   - "Ações Rápidas" (Botões Card enormes na tela): "+" Novo Orçamento, "+" Nova Ordem de Serviço, "+" Novo Cliente.

3. **Gestão de Clientes (Minimalista):**
   - Lista filtrável/buscável por nome ou telefone.
   - Cadastro básico: Nome Completo, WhatsApp (com botão de clique pro zap automático), Endereço do Local da Obra (Rua, Número, Bairro, CEP).

4. **Painel de Ordens de Serviço (OS):**
   - Criação ágil vinculando a um cliente existente.
   - Campos vitais: Diagnóstico/Defeito, Descrição do que será executado.
   - **Registro Fotográfico (Crucial):** Botão grande de "Câmera", para tirar as fotos do estado inicial (Antes) e após o serviço (Depois). Faça upload usando API nativa para o Supabase Storage.
   - Status da OS: (Novo, Em Andamento, Aguardando Material, Finalizado, Cancelado).

5. **Orçamentos "Matadores" & Cálculos Embutidos (Aprovação VIP):**
   - **Calculadora de Canteiro:** Antes de jogar no escopo, o app deve ter *wizards* simples integrados (Ex: Inserir comprimento x largura para calcular "m²" de piso/pintura, ou somadores de metros lineares para infraestrutura).
   - Tela para formular valores no local da obra e no susto. Deve permitir adicionar itens de linha dinamicamente divididos em: **Materiais** (puxando as quantidades já calculadas e inserindo preço unitário = total da linha) e **Mão de Obra** (valor fixo e descrição).
   - Somatório automático total e campo de Adicional (taxa de urgência/deslocamento) ou Desconto (%).
   - **Mágica do Fechamento:** Ao concluir, o app formata esses dados injetando em um HTML template elegante, gera um PDF através do `expo-print` que fica na aparência de um orçamento premium (com a cor do app). O usuário clica "Enviar Orçamento por WhatsApp" direto do share local.

6. **Regra de Ouro: Funcionar Sem Internet (Offline-First)**
   - Eletricistas lidam com quadros de subsolo, e na obra frequentemente o 4G/Wi-Fi falha ou inexiste.
   - Aplique estratégias como Persistência local (`@react-native-async-storage/async-storage` com WatermelonDB se precisar estruturado) e sistema de **fila de sincronização**. Se enviar uma OS offline, o app guarda e sincroniza magicamente quando receber rede. Mudar a UI para "Status: Sincronizando".

---

## 📝 Plano de Ação Passo a Passo de Execução

Eu quero que você (IA) aja cooperativamente. Nunca me mande arquivos com 500 linhas de código tentando resolver o app inteiro de uma vez, senão vou ficar sobrecarregado. Faremos em passos controláveis.

**Regra Suprema:** Pergunte sempre se estou de acordo, se executei com sucesso o setup, e só depois de eu confirmar "ok, passo executado sem erro", você me envia as instruções e códigos do próximo Passo. 

**Passo 1: Arquitetura e Setup Iniciais**
Crie e exiba os comandos para iniciar o `npx create-expo-app` com routing tipado. Instale as libs básicas necessárias (`supabase-js`, `nativewind`, etc.). Faremos a organização inicial das pastas (`/app`, `/components`, `/lib/supabase`).

**Passo 2: Modelagem de Dados no Supabase (SQLs)**
Me passe todos os códigos SQL formatados perfeitamente para eu colar no SQL Editor do Supabase. Precisamos da tabela de Usuários (Profiles), Clientes, Ordens de Serviço (service_orders), e Itens do Orçamento. Lembre-se essencialmente das *Row Level Security (RLS)* para um usuário não enxergar dados do pedreiro concorrente. Me entregue também o código TypeScript (tipos exportados).

**Passo 3: Tela de Login e Contexto Auth**
Configure a lógica de proteção de rotas com `_layout.tsx`, de modo que deslogado fica na tela de Login, logado cai no `(tabs)`. Desenvolva o Provider do Supabase UI.

**Passo 4: Construção da Base Navigation & Dashboard**
Monte o arquivo de bottom tabs e crie a telinha de *Home* com métricas fictícias para testar e com os botões "Gordos" e luxuosos de Quick Action (Novo OS, Novo Cliente).

**Passo 5: Desenvolver Fluxo de Clientes e Câmera da OS**
Construa o CRUD de clientes primeiro. Em seguida a listagem de OS. Aqui gastaremos uma interação desenvolvendo o Hook ou utilitário da ponte com `expo-camera` ou `expo-image-picker` visando pegar imagens comprimidas e jogar pro Supabase bucket.

**Passo 6: Orçamentos Complexos + Geração de PDF Show de Bola**
Para fechar o MVP do app: Desenvolva a tela do orçamento, a lógica de somar itens, a geração stringificada do HTML, o uso do `expo-print` até salvar o PDF temporariamente. Conecte pelo `expo-sharing` pro zap.

---
**Entrada (Prompt Inicial a enviar à IA):**
"Você entendeu o contexto e o Plano de Ação? Se sim, me responda dizendo apenas 'Contexto Assegurado. Posso enviar as instruções do Passo 1 do Setup e os comandos do terminal agora?'"
