-- ==================================================
-- SEED DATA - WTech SaaS (Compra Assistida)
-- Execute este script no Editor SQL do Supabase
-- ==================================================

-- ⚠️ INSTRUÇÃO PARA USUÁRIO AUTH:
-- Opção 1: Use seu próprio ID após criar conta via Auth
--          SELECT id FROM auth.users WHERE email = 'seu@email.com';
-- Opção 2: Use o UUID fake abaixo (apenas para testes)

-- UUID fake para o usuário (substitua pelo seu real se preferir)
DO $$
DECLARE
  user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  customer_1 UUID := gen_random_uuid();
  customer_2 UUID := gen_random_uuid();
  customer_3 UUID := gen_random_uuid();
  equipment_1 UUID := gen_random_uuid();
  equipment_2 UUID := gen_random_uuid();
  equipment_3 UUID := gen_random_uuid();
  equipment_4 UUID := gen_random_uuid();
  equipment_5 UUID := gen_random_uuid();
BEGIN

  -- ==================================================
  -- CLIENTES (3 variados)
  -- ==================================================
  INSERT INTO customers (id, name, email, phone, document, address) VALUES
  (customer_1, 'João Silva Santos', 'joao.silva@email.com', '(11) 99999-1234', '123.456.789-00', 'Rua das Flores, 123 - São Paulo/SP'),
  (customer_2, 'Maria Oliveira Tech LTDA', 'contato@mariaoliveira.com.br', '(11) 3333-4567', '12.345.678/0001-90', 'Av. Paulista, 1000 - Sala 501 - São Paulo/SP'),
  (customer_3, 'Carlos Eduardo Pereira', 'carlos.pereira@gmail.com', '(21) 98765-4321', '987.654.321-00', 'Rua do Comércio, 456 - Rio de Janeiro/RJ');

  -- ==================================================
  -- EQUIPAMENTOS (5 variados)
  -- ==================================================
  INSERT INTO equipments (id, customer_id, type, model, brand, serial_number) VALUES
  (equipment_1, customer_1, 'Notebook', 'Inspiron 15 3000', 'Dell', 'DL2024ABC123'),
  (equipment_2, customer_1, 'Desktop', 'OptiPlex 7090', 'Dell', 'DL2023XYZ789'),
  (equipment_3, customer_2, 'Servidor', 'PowerEdge R740', 'Dell', 'SVR2024001'),
  (equipment_4, customer_2, 'Notebook', 'ThinkPad T14', 'Lenovo', 'LNV2024T14001'),
  (equipment_5, customer_3, 'Notebook', 'MacBook Pro 14"', 'Apple', 'C02X12345678');

  -- ==================================================
  -- ORDENS DE SERVIÇO (5 com status variados)
  -- ==================================================
  
  -- OS 1: Status OPEN (recém aberta)
  INSERT INTO orders (
    id, customer_id, equipment_id, status, 
    description, created_at
  ) VALUES (
    gen_random_uuid(), customer_1, equipment_1, 'open',
    'Notebook não liga após queda. Cliente relata que derrubou o equipamento ontem.',
    NOW() - INTERVAL '2 hours'
  );

  -- OS 2: Status ANALYZING
  INSERT INTO orders (
    id, customer_id, equipment_id, status,
    description, diagnosis, created_at
  ) VALUES (
    gen_random_uuid(), customer_2, equipment_3, 'analyzing',
    'Servidor apresentando lentidão extrema e travamentos frequentes.',
    'Identificado possível falha em um dos discos do RAID. Executando diagnóstico completo.',
    NOW() - INTERVAL '1 day'
  );

  -- OS 3: Status WAITING_PARTS + COMPRA ASSISTIDA (cliente compra a peça)
  INSERT INTO orders (
    id, customer_id, equipment_id, status,
    description, diagnosis, 
    parts_cost_external, estimated_value, notes,
    created_at
  ) VALUES (
    gen_random_uuid(), customer_1, equipment_2, 'waiting_parts',
    'Desktop reiniciando sozinho durante uso intensivo.',
    'Fonte de alimentação com capacitores estufados. Necessária substituição urgente. Cliente comprará a peça no Mercado Livre.',
    0.00, -- Cliente compra externamente
    150.00, -- Apenas mão de obra
    'COMPRA ASSISTIDA: Cliente optou por comprar a fonte Corsair CV550 no ML. Link enviado via WhatsApp.',
    NOW() - INTERVAL '3 days'
  );

  -- OS 4: Status IN_PROGRESS
  INSERT INTO orders (
    id, customer_id, equipment_id, status,
    description, diagnosis, 
    parts_cost_external, estimated_value,
    created_at
  ) VALUES (
    gen_random_uuid(), customer_2, equipment_4, 'in_progress',
    'Tela do notebook com manchas e linhas horizontais.',
    'Display LCD danificado. Peça original já em mãos, iniciando substituição.',
    850.00,
    1200.00,
    NOW() - INTERVAL '5 days'
  );

  -- OS 5: Status FINISHED (concluída)
  INSERT INTO orders (
    id, customer_id, equipment_id, status,
    description, diagnosis,
    parts_cost_external, estimated_value, final_value,
    created_at, finished_at
  ) VALUES (
    gen_random_uuid(), customer_3, equipment_5, 'finished',
    'MacBook não carrega bateria.',
    'Porta USB-C com mau contato. Realizada limpeza e micro soldagem nos contatos.',
    0.00,
    300.00,
    280.00, -- Desconto aplicado
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '7 days'
  );

  RAISE NOTICE '✅ Seed executado com sucesso!';
  RAISE NOTICE '   - 3 Clientes inseridos';
  RAISE NOTICE '   - 5 Equipamentos inseridos';
  RAISE NOTICE '   - 5 Ordens de Serviço inseridas';

END $$;

-- ==================================================
-- VERIFICAÇÃO (execute separadamente se quiser)
-- ==================================================
-- SELECT * FROM customers;
-- SELECT * FROM equipments;
-- SELECT o.*, c.name as customer_name, e.model as equipment_model 
-- FROM orders o 
-- LEFT JOIN customers c ON o.customer_id = c.id
-- LEFT JOIN equipments e ON o.equipment_id = e.id;
