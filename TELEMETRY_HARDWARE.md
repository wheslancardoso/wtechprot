# Documentação: Sistema de Telemetria de Hardware 🚀

Este documento descreve a arquitetura, funcionalidades e fluxos do sistema de telemetria de hardware implementado no **WTech App**. O objetivo é permitir que técnicos capturem dados reais de performance e saúde dos equipamentos para gerar laudos técnicos profissionais e baseados em dados.

---

## 1. Visão Geral
O sistema de telemetria permite o upload de logs gerados por ferramentas de diagnóstico populares (HWiNFO, CrystalDiskInfo, HWMonitor). Ele extrai automaticamente os dados relevantes, armazena de forma otimizada e exibe comparações entre o estado inicial (diagnóstico) e o estado final (pós-reparo).

## 2. Ferramentas Suportadas & Parsers
O sistema utiliza uma combinação de **Regex (Expressões Regulares)** para velocidade e **IA (LLM)** para resiliência.

| Ferramenta | Formato | Dados Extraídos |
| :--- | :--- | :--- |
| **HWiNFO** | `.txt` | CPU Temp (Max), RAM (Velocidade, Slots, Tipo), SSD Capacity, Battery Wear. |
| **CrystalDiskInfo** | `.txt` | SSD Health (%), Total Host Writes (TBW), Capacidade Total. |
| **HWMonitor** | `.txt` | CPU Temp (Max), SSD Capacity. |

### 2.1 Inteligência Artificial (Fallback)
Caso os parsers de Regex falhem devido a mudanças de versão nas ferramentas ou idiomas diferentes (ex: logs em Português), o sistema encaminha o conteúdo bruto para um agente de IA especializado que realiza a extração semântica dos dados.

## 3. Arquitetura de Dados

### 3.1 Camada de Banco de Dados (Supabase)
Tabela: `hardware_telemetry`
- `order_id`: Vínculo com a Ordem de Serviço.
- `stage`: Define o momento da captura (`initial`, `post_repair`, `final`).
- `source_type`: Origem do log.
- **Métricas**: `cpu_temp_max`, `ssd_health_percent`, `ssd_tbw`, `ram_speed`, `ram_slots`, `ssd_total_gb`.

### 3.2 Otimização "Log Slimming"
Para economizar espaço no banco de dados, o arquivo bruto é descartado após o processamento, mantendo apenas o JSON enriquecido com as métricas extraídas.

### 3.3 Agregação Inteligente
Diferentes arquivos subidos para o mesmo `stage` são mesclados. 
*Exemplo: Subir um log do HWiNFO (temperatura) e depois um do CrystalDisk (saúde SSD) resultará em um único dashboard consolidado com ambas as informações.*

## 4. Interface do Usuário (UI/UX)

### 4.1 Aba "Hardware"
Centraliza todas as informações de telemetria na página de detalhes da ordem de serviço.

### 4.2 Telemetry Dashboard (Premium Design)
- **Glassmorphism Style**: Design moderno com transparências e gradientes.
- **Ficha Técnica**: Exibição clara de CPU, RAM e Armazenamento.
- **Health Scores**: Barras de progresso coloridas para Saúde do SSD e Desgaste da Bateria.

### 4.3 Temperature Comparison (Evolução Técnica)
Compara os estágios da OS para provar a eficácia do reparo:
- **Visualização de Delta**: Mostra explicitamente a variação (+22°C, -10°C).
- **Cores Semânticas**: Verde para melhoria de performance, vermelho para degradação.
- **SSD Tracking**: Monitora quanto o SSD foi utilizado durante os testes em laboratório (TBW).

## 5. Fluxo de Trabalho do Técnico
1. Realiza o teste de estresse no equipamento do cliente.
2. Exporta o log em `.txt` das ferramentas suportadas.
3. No WTech App, acessa a aba **Hardware** e faz o upload do arquivo.
4. O sistema processa e atualiza o dashboard instantaneamente.
5. Ao finalizar o reparo, realiza um novo upload como "Relatório Final" para gerar a comparação.

---
*Documentação atualizada em 02/02/2026.*
