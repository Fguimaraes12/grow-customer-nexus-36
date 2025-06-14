
-- Remover tabelas existentes para recriar do zero
DROP TABLE IF EXISTS public.orcamento_items CASCADE;
DROP TABLE IF EXISTS public.orcamentos CASCADE;

-- Recriar tabela de orçamentos com estrutura otimizada
CREATE TABLE public.orcamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  client_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'Aguardando',
  total numeric NOT NULL DEFAULT 0,
  delivery_date date,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recriar tabela de itens do orçamento
CREATE TABLE public.orcamento_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric GENERATED ALWAYS AS (price * quantity) STORED,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recriar índices para performance
CREATE INDEX idx_orcamentos_client_id ON public.orcamentos(client_id);
CREATE INDEX idx_orcamento_items_orcamento_id ON public.orcamento_items(orcamento_id);
CREATE INDEX idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX idx_orcamentos_date ON public.orcamentos(date);

-- Inserir dados de exemplo
INSERT INTO public.orcamentos (title, client_name, status, total, delivery_date, date) VALUES
('Banner para inauguração', 'João Silva', 'Finalizado', 160.00, '2024-12-20', '2024-12-01'),
('Material promocional', 'Maria Santos', 'Aguardando', 105.00, '2024-12-25', '2024-12-10'),
('Identidade visual completa', 'Pedro Costa', 'Aguardando', 280.00, '2024-12-30', '2024-12-15');

-- Inserir itens de exemplo (vamos pegar os IDs dos orçamentos criados)
DO $$
DECLARE
    orcamento1_id uuid;
    orcamento2_id uuid;
    orcamento3_id uuid;
BEGIN
    -- Buscar IDs dos orçamentos
    SELECT id INTO orcamento1_id FROM public.orcamentos WHERE title = 'Banner para inauguração';
    SELECT id INTO orcamento2_id FROM public.orcamentos WHERE title = 'Material promocional';
    SELECT id INTO orcamento3_id FROM public.orcamentos WHERE title = 'Identidade visual completa';
    
    -- Inserir itens para o primeiro orçamento
    INSERT INTO public.orcamento_items (orcamento_id, product_name, price, quantity) VALUES
    (orcamento1_id, 'Banner 2x1m', 80.00, 2);
    
    -- Inserir itens para o segundo orçamento
    INSERT INTO public.orcamento_items (orcamento_id, product_name, price, quantity) VALUES
    (orcamento2_id, 'Cartão de Visita', 35.00, 2),
    (orcamento2_id, 'Adesivo Vinil', 25.00, 1),
    (orcamento2_id, 'Flyer A5', 45.00, 1);
    
    -- Inserir itens para o terceiro orçamento
    INSERT INTO public.orcamento_items (orcamento_id, product_name, price, quantity) VALUES
    (orcamento3_id, 'Banner 2x1m', 80.00, 1),
    (orcamento3_id, 'Placa ACM', 150.00, 1),
    (orcamento3_id, 'Cartão de Visita', 35.00, 1),
    (orcamento3_id, 'Adesivo Vinil', 25.00, 1);
END $$;
