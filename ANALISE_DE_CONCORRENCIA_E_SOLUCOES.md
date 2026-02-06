# Análise de Concorrência e Soluções do Sistema WTech

Este documento compila as reclamações frequentes observadas em concorrentes locais e detalha como o sistema WTech SaaS foi tecnicamente projetado para mitigar ou eliminar esses problemas, garantindo transparência e segurança jurídica.

---

## 1. Compilação Consolidada de Reclamações (Concorrência)

### A. Atendimento e Prazos
- **Primetek**: Atendimento precário, vendedores ignoram clientes, prazos de 72h que viram semanas.
- **Tiger Informática**: Funcionários distraídos no WhatsApp, erros simples.
- **Getech/Tws**: Demora excessiva, retenção de equipamentos por meses sem solução.
- **Geral**: Falta de resposta, bloqueio no WhatsApp, dificuldade em obter status.

### B. Danos Físicos e Negligência
- **Primetek/Tws**: Equipamentos devolvidos com arranhões, presilhas quebradas, gabinetes amassados.
- **Tiger**: Carcaça perfurada, cooler quebrado por imperícia.
- **União Informática**: HD substituído por modelo amassado.
- **Star Play**: Peças internas quebradas, parafusos soltos.

### C. Ética, Venda Casada e Orçamentos
- **Primetek**: Venda casada de peças superfaturadas (300% acima).
- **Notebooks Goiânia**: Orçamento abusivo (R$ 2.600 por reparo inexistente).
- **Zeus Tech**: "Capitalizar" em cima do cliente trocando peças boas.
- **Rede Informática**: Diagnóstico falso de "placa mãe" para problema de software.
- **Leotec/União**: Roubo de peças, troca por sucata ou itens usados.

### D. Privacidade e Segurança de Dados
- **Primetek**: Acesso indevido a fotos pessoais.
- **Zeus Tech**: Uso do PC do cliente para postar avaliação falsa.
- **Digital Center**: Bisbilhotagem em arquivos pessoais.
- **Leão Informática**: Venda de notebook de cliente sem autorização.

### E. Consumíveis e Pequenos Furtos
- **Primetek**: Apropriação de papéis e cartuchos novos.
- **Millenium**: Uso de pasta de dente no processador (absurdo técnico).

---

## 2. Como o Sistema WTech Resolve (Funcionalidades Atuais)

O sistema foi arquitetado com pilares de **Transparência Radical** e **Evidência Documental** para blindar a assistência técnica e o cliente.

### ✅ Solução para: Venda Casada e Peças Superfaturadas
**Funcionalidade: Modelo de Compra Externa (Anti-Ágio)**
- **Como funciona**: O sistema WTech separa explicitamente a "Mão de Obra" do custo das "Peças".
- **Diferencial**: Na tela de aprovação do cliente (`/os/[id]`), o sistema lista as peças necessárias com **links externos diretos** para o cliente comprar (ex: Amazon, Mercado Livre).
- **Resultado**: Elimina a suspeita de lucro abusivo sobre peças. O técnico ganha pelo seu saber (mão de obra), e o cliente tem liberdade de escolha, resolvendo reclamações da *Primetek* e *Notebooks Goiânia*.

### ✅ Solução para: Danos Físicos e "Peças Trocadas"
**Funcionalidade: Módulo de Evidências (Check-in/Check-out)**
- **Como funciona**:
  - **Check-in**: Antes de qualquer reparo, o técnico é obrigado a fazer upload de fotos do estado atual do equipamento (`photos_checkin`).
  - **Check-out**: Na entrega, novas fotos são exigidas (`photos_checkout`).
- **Diferencial**: As fotos ficam imutáveis na ordem de serviço e visíveis para o cliente. Se o cliente alegar um risco no gabinete que já existia, a foto de entrada comprova. Se a *Tws Informática* entregou um PC sem vidro, no WTech isso seria impossível de fechar sem a evidência.

### ✅ Solução para: Orçamentos Abusivos e Diagnósticos Falsos
**Funcionalidade: Aprovação Digital e Laudo Técnico Transparente**
- **Como funciona**: O cliente recebe um link único para visualizar sua Ordem de Serviço (`/os/[id]`).
- **Status `waiting_approval`**: O sistema bloqueia o avanço do serviço até o cliente clicar em "Aprovar" digitalmente.
- **Laudo Técnico**: O diagnóstico fica registrado textualmente. O cliente vê exatamente o que foi diagnosticado antes de autorizar valores.
- **Resultado**: Fim das taxas surpresa (*Casa do Notebook*) ou serviços feitos sem autorização. Tudo requer "de acordo" digital.

### ✅ Solução para: Prazos, "Enrolação" e Falta de Resposta
**Funcionalidade: Rastreamento em Tempo Real (Realtime Tracker)**
- **Como funciona**: O cliente tem acesso a uma "Timeline" ao vivo (similar a iFood/Uber).
- **Visibilidade**: Cada etapa (`Em Análise`, `Aguardando Peças`, `Em Reparo`) é atualizada instantaneamente.
- **Diferencial**: O cliente não precisa ligar ou mandar WhatsApp perguntando "já está pronto?". Ele vê que a máquina está "Em Bancada" ou "Finalizada" em tempo real, mitigando a ansiedade e a sensação de descaso (*Getech/Tiger*).

### ✅ Solução para: Privacidade e Dados Sensíveis
**Funcionalidade: Mascaramento de Credenciais**
- **Como funciona**: Senhas do Windows e IDs de acesso remoto (AnyDesk) são armazenados em campos específicos que ficam ocultos por padrão na interface do técnico.
- **Alerta de Segurança**: O campo de senha exibe alertas visuais, desencorajando o acesso frívolo.
- **Histórico (Audit Logs)**: O sistema registra quem alterou status e quem mexeu na OS `timeline-actions.ts`, criando um rastro de responsabilidade.

### ✅ Solução para: Segurança Jurídica (Termos)
**Funcionalidade: Termo de Retirada com Assinatura Digital**
- **Como funciona**: Na entrega, o sistema gera um Termo de Retirada (`withdrawal-term-pdf`) com os dados do equipamento e condições de garantia.
- **Assinatura**: O cliente assina digitalmente (`custody_signature_url`), confirmando que recebeu o equipamento em ordem e com os acessórios listados. Isso protege a loja contra alegações tardias de "sumiço de memória" (*União Informática*).

---

## 3. Implementações Futuras (Roadmap)

Os itens abaixo foram identificados como melhorias para blindar ainda mais contra reclamações específicas (ex: consumíveis e ética fina).

- [ ] **Controle de Insumos e Consumíveis**:
  - *Problema*: "Apropriação de folhas de papel/cartuchos" (Primetek).
  - *Solução Planejada*: Módulo de inventário que obriga a foto do nível de tinta/contadores de impressão no Check-in e Check-out para impressoras.

- [ ] **Modo "Privacidade Total" (Guest Mode)**:
  - *Problema*: "Bisbilhotagem de arquivos" (Digital Center).
  - *Solução Planejada*: Check-box no Check-in onde o cliente declara que não autoriza acesso aos dados, instruindo o técnico a usar boot por sistema externo (Linux Live USB) para testes de hardware, sem logar no usuário do cliente.

- [ ] **Validação de Número de Série de Componentes**:
  - *Problema*: "Troca de peças boas por ruins" (Leotec).
  - *Solução Planejada*: Campos específicos para cadastrar S/N de Placa de Vídeo/Memória na entrada e validar na saída automaticamente.
