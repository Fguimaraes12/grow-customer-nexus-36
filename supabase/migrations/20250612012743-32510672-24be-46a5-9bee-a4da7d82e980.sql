
-- Primeiro, vamos remover as tabelas existentes para recriar tudo
DROP TABLE IF EXISTS public.orcamento_items CASCADE;
DROP TABLE IF EXISTS public.orcamentos CASCADE;
DROP TABLE IF EXISTS public.faturas CASCADE;
DROP TABLE IF EXISTS public.despesas CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de orçamentos
CREATE TABLE public.orcamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  client_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'Aguardando',
  total numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de itens do orçamento
CREATE TABLE public.orcamento_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric GENERATED ALWAYS AS (price * quantity) STORED,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de faturas (receitas)
CREATE TABLE public.faturas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  client_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  value numeric NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'Pendente',
  orcamento_id uuid REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de despesas
CREATE TABLE public.despesas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  value numeric NOT NULL,
  date date NOT NULL,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de agenda/compromissos
CREATE TABLE public.agenda (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  client_name text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'Agendado',
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de logs do sistema
CREATE TABLE public.logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_name text,
  description text,
  user_name text,
  timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_orcamentos_client_id ON public.orcamentos(client_id);
CREATE INDEX idx_orcamento_items_orcamento_id ON public.orcamento_items(orcamento_id);
CREATE INDEX idx_faturas_client_id ON public.faturas(client_id);
CREATE INDEX idx_faturas_orcamento_id ON public.faturas(orcamento_id);
CREATE INDEX idx_agenda_client_id ON public.agenda(client_id);
CREATE INDEX idx_agenda_start_time ON public.agenda(start_time);
CREATE INDEX idx_logs_timestamp ON public.logs(timestamp);

-- Inserir dados de exemplo
INSERT INTO public.clientes (name, phone, address, email) VALUES
('João Silva', '(11) 99999-9999', 'Rua das Flores, 123 - São Paulo/SP', 'joao@email.com'),
('Maria Santos', '(11) 88888-8888', 'Av. Paulista, 456 - São Paulo/SP', 'maria@email.com'),
('Pedro Costa', '(11) 77777-7777', 'Rua Augusta, 789 - São Paulo/SP', 'pedro@email.com');

INSERT INTO public.produtos (name, price, description, category) VALUES
('Banner 2x1m', 80.00, 'Banner em lona 440g com impressão digital', 'Impressão'),
('Adesivo Vinil', 25.00, 'Adesivo em vinil branco para recorte', 'Adesivos'),
('Placa ACM', 150.00, 'Placa em ACM 3mm com impressão digital', 'Placas'),
('Cartão de Visita', 35.00, 'Cartão de visita em papel couché 300g (1000 unidades)', 'Gráfica'),
('Flyer A5', 45.00, 'Flyer A5 em papel couché 150g (1000 unidades)', 'Gráfica');

-- Inserir orçamentos de exemplo
INSERT INTO public.orcamentos (title, client_name, status, total, date) VALUES
('Banner para inauguração', 'João Silva', 'Finalizado', 160.00, '2024-12-01'),
('Material promocional', 'Maria Santos', 'Aguardando', 105.00, '2024-12-10'),
('Identidade visual completa', 'Pedro Costa', 'Aguardando', 280.00, '2024-12-15');

-- Inserir faturas de exemplo
INSERT INTO public.faturas (title, client_name, value, date, status) VALUES
('Pagamento Banner João Silva', 'João Silva', 160.00, '2024-12-05', 'Pago'),
('Entrada Material Maria Santos', 'Maria Santos', 50.00, '2024-12-12', 'Pendente');

-- Inserir despesas de exemplo
INSERT INTO public.despesas (title, description, value, date, category) VALUES
('Tinta para impressão', 'Compra de tinta cyan para plotter', 120.00, '2024-12-01', 'Material'),
('Energia elétrica', 'Conta de luz da gráfica', 280.00, '2024-12-05', 'Utilidades'),
('Papel couché', 'Resma de papel couché 300g', 85.00, '2024-12-08', 'Material');

-- Inserir compromissos de exemplo
INSERT INTO public.agenda (title, description, client_name, start_time, end_time, status, location) VALUES
('Reunião aprovação projeto', 'Apresentar propostas de layout', 'Maria Santos', '2024-12-20 14:00:00', '2024-12-20 15:00:00', 'Agendado', 'Escritório'),
('Entrega de material', 'Entrega dos banners prontos', 'João Silva', '2024-12-18 10:00:00', '2024-12-18 10:30:00', 'Concluído', 'Cliente'),
('Briefing novo projeto', 'Levantamento de necessidades', 'Pedro Costa', '2024-12-22 16:00:00', '2024-12-22 17:00:00', 'Agendado', 'Online');
