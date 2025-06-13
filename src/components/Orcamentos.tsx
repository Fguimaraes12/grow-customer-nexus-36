import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { OrcamentoModal } from "./modals/OrcamentoModal";
import { useLogs } from "@/contexts/LogsContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function Orcamentos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const { addLog } = useLogs();
  const queryClient = useQueryClient();

  // Função para converter data brasileira (dd/mm/yyyy) para formato ISO (yyyy-mm-dd)
  const convertBrazilianDateToISO = (brazilianDate) => {
    if (!brazilianDate) return new Date().toISOString().split('T')[0];
    
    // Se já está no formato ISO (yyyy-mm-dd), retorna como está
    if (brazilianDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return brazilianDate;
    }
    
    // Se está no formato brasileiro (dd/mm/yyyy), converte
    if (brazilianDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [day, month, year] = brazilianDate.split('/');
      const formattedDay = day.padStart(2, '0');
      const formattedMonth = month.padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
    
    // Fallback para data atual
    return new Date().toISOString().split('T')[0];
  };

  // Função para formatar data ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy)
  const formatDateToBrazilian = (isoDate) => {
    if (!isoDate) return '';
    return isoDate.split('-').reverse().join('/');
  };

  // Fetch budgets from Supabase
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          orcamento_items (
            id,
            product_name,
            price,
            quantity,
            subtotal
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 0, // Dados sempre considerados stale
    cacheTime: 1000 * 60 * 5, // Cache por 5 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch clients for the modal
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch products for the modal
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, name, price')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const { items, ...orcamentoData } = budgetData;
      
      // Calculate total from items
      const totalValue = items.reduce((total: number, item: any) => {
        const itemPrice = typeof item.price === 'string' 
          ? parseFloat(item.price.replace(',', '.'))
          : item.price;
        return total + (item.quantity * itemPrice);
      }, 0);

      // Prepare orçamento data
      const dataToInsert = {
        title: orcamentoData.title || `Orçamento #${Date.now()}`,
        client_name: orcamentoData.client,
        date: convertBrazilianDateToISO(orcamentoData.deliveryDate),
        total: totalValue,
        status: orcamentoData.status || 'Aguardando'
      };

      console.log('Inserting budget data:', dataToInsert);
      
      // First create the budget
      const { data: orcamento, error: orcamentoError } = await supabase
        .from('orcamentos')
        .insert([dataToInsert])
        .select()
        .single();
      
      if (orcamentoError) throw orcamentoError;
      
      // Then create the items
      if (items && items.length > 0) {
        const itemsData = items.map((item: any) => {
          const itemPrice = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(',', '.'))
            : item.price;
          
          return {
            orcamento_id: orcamento.id,
            product_name: item.name,
            price: itemPrice,
            quantity: item.quantity,
            subtotal: item.quantity * itemPrice
          };
        });
        
        console.log('Inserting items data:', itemsData);
        
        const { error: itemsError } = await supabase
          .from('orcamento_items')
          .insert(itemsData);
        
        if (itemsError) throw itemsError;
      }
      
      return orcamento;
    },
    onSuccess: async (data) => {
      // Primeiro, invalida as queries
      await queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      await queryClient.invalidateQueries({ queryKey: ['orcamentos-agenda'] });
      
      // Depois força o refetch
      await queryClient.refetchQueries({ queryKey: ['orcamentos'] });
      
      // Log da operação
      addLog('create', 'orcamento', data.title, `Cliente: ${data.client_name} - Total: R$ ${data.total}`);
      
      // Limpa os estados
      setModalOpen(false);
      setEditingBudget(null);
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
    }
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const { items, id, ...orcamentoData } = budgetData;
      
      // Calculate total from items
      const totalValue = items.reduce((total: number, item: any) => {
        const itemPrice = typeof item.price === 'string' 
          ? parseFloat(item.price.replace(',', '.'))
          : item.price;
        return total + (item.quantity * itemPrice);
      }, 0);

      // Update the budget
      const { data: orcamento, error: orcamentoError } = await supabase
        .from('orcamentos')
        .update({
          client_name: orcamentoData.client,
          date: convertBrazilianDateToISO(orcamentoData.deliveryDate),
          total: totalValue,
          status: orcamentoData.status || 'Aguardando'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (orcamentoError) throw orcamentoError;
      
      // Delete existing items
      await supabase
        .from('orcamento_items')
        .delete()
        .eq('orcamento_id', id);
      
      // Insert new items
      if (items && items.length > 0) {
        const itemsData = items.map((item: any) => {
          const itemPrice = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(',', '.'))
            : item.price;
          
          return {
            orcamento_id: id,
            product_name: item.name,
            price: itemPrice,
            quantity: item.quantity,
            subtotal: item.quantity * itemPrice
          };
        });
        
        const { error: itemsError } = await supabase
          .from('orcamento_items')
          .insert(itemsData);
        
        if (itemsError) throw itemsError;
      }
      
      return orcamento;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      await queryClient.invalidateQueries({ queryKey: ['orcamentos-agenda'] });
      await queryClient.refetchQueries({ queryKey: ['orcamentos'] });
      
      addLog('edit', 'orcamento', data.title, `Cliente: ${data.client_name} - Total: R$ ${data.total}`);
      setModalOpen(false);
      setEditingBudget(null);
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
    }
  });

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', budgetId);
      
      if (error) throw error;
      return budgetId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      await queryClient.refetchQueries({ queryKey: ['orcamentos'] });
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('orcamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      await queryClient.refetchQueries({ queryKey: ['orcamentos'] });
      addLog('edit', 'orcamento', data.title, `Status alterado para: ${data.status}`);
    },
    onError: (error) => {
      console.error('Error updating status:', error);
    }
  });

  const formatCurrency = (value: any) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value || 0);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const handleSaveBudget = async (budgetData: any) => {
    try {
      console.log('Saving budget:', budgetData);
      
      if (editingBudget) {
        await updateBudgetMutation.mutateAsync({ ...budgetData, id: editingBudget.id });
      } else {
        await createBudgetMutation.mutateAsync(budgetData);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      try {
        await deleteBudgetMutation.mutateAsync(budgetId);
        addLog('delete', 'orcamento', budget.title, `Cliente: ${budget.client_name}`);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleStatusChange = async (budgetId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: budgetId, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditBudget = (budget: any) => {
    // Transform the budget data to match the modal's expected format
    const transformedBudget = {
      ...budget,
      deliveryDate: formatDateToBrazilian(budget.date), // Converte para formato brasileiro
      items: budget.orcamento_items || []
    };
    setEditingBudget(transformedBudget);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return 'bg-green-600 text-white border-green-600';
      case 'Aguardando':
        return 'bg-blue-600 text-white border-blue-600';
      default:
        return 'bg-gray-600 text-white border-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-crm-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando orçamentos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Orçamentos</h1>
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budgets */}
      <div className="grid grid-cols-1 gap-6">
        {budgets.map((budget) => (
          <Card key={budget.id} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{budget.title}</h3>
                    <Select
                      value={budget.status}
                      onValueChange={(value) => handleStatusChange(budget.id, value)}
                    >
                      <SelectTrigger className={`w-32 ${getStatusColor(budget.status)} border-none`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-crm-dark border-crm-border">
                        <SelectItem value="Aguardando" className="text-white">Aguardando</SelectItem>
                        <SelectItem value="Finalizado" className="text-white">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditBudget(budget)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-400">{budget.client_name}</p>
                  <p className="text-gray-400 text-sm">{formatDateToBrazilian(budget.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total do Orçamento</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(budget.total)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Itens do Orçamento:</h4>
                <div className="space-y-2">
                  {budget.orcamento_items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-300">
                      <span>({item.quantity}x) - {item.product_name}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrcamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clientes={clientes}
        produtos={produtos}
        budget={editingBudget}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
