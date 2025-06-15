import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Package, DollarSign, AlertTriangle } from "lucide-react";
import { format, isAfter, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function Agenda() {
  const { data: budgets = [], isLoading, refetch } = useQuery({
    queryKey: ['orcamentos-agenda'],
    queryFn: async () => {
      console.log('🔍 Executando query da agenda...');
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
        .eq('status', 'Aguardando')
        .order('delivery_date', { ascending: true, nullsFirst: false });
      
      if (error) {
        console.error('❌ Erro ao buscar orçamentos da agenda:', error);
        throw error;
      }
      
      console.log('✅ Orçamentos da agenda carregados:', data);
      console.log('📊 Quantidade de orçamentos "Aguardando":', data?.length || 0);
      
      // Log detalhado dos status
      data?.forEach((budget, index) => {
        console.log(`📋 Orçamento ${index + 1}:`, {
          id: budget.id,
          title: budget.title,
          client: budget.client_name,
          status: budget.status,
          delivery_date: budget.delivery_date
        });
      });
      
      return data;
    },
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não manter cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  const getDeliveryStatus = (deliveryDate: string | null) => {
    if (!deliveryDate) {
      return { status: "sem-data", color: "bg-gray-600 text-white" };
    }
    
    const today = new Date();
    const delivery = new Date(deliveryDate + 'T00:00:00');
    
    if (isSameDay(delivery, today)) {
      return { status: "hoje", color: "bg-yellow-600 text-white" };
    } else if (isAfter(today, delivery)) {
      return { status: "atrasado", color: "bg-red-600 text-white" };
    } else {
      return { status: "agendado", color: "bg-green-600 text-white" };
    }
  };

  const formatDeliveryDate = (dateString: string | null) => {
    if (!dateString) return "Data não definida";
    const date = new Date(dateString + 'T00:00:00');
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "hoje":
        return "Entrega Hoje";
      case "atrasado":
        return "Atrasado";
      case "agendado":
        return "Agendado";
      case "sem-data":
        return "Sem Data";
      default:
        return "Agendado";
    }
  };

  const getTotalQuantity = (items: any[]) => {
    return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  const formatCurrency = (value: number | string) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value?.toString() || '0');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  // Separar orçamentos com e sem data de entrega
  const budgetsWithDate = budgets.filter(budget => budget.delivery_date);
  const budgetsWithoutDate = budgets.filter(budget => !budget.delivery_date);

  console.log('🎯 Renderizando Agenda com:', {
    totalBudgets: budgets.length,
    budgetsWithDate: budgets.filter(b => b.delivery_date).length,
    budgetsWithoutDate: budgets.filter(b => !b.delivery_date).length
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-crm-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-8 w-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Agenda de Entregas</h1>
        <button 
          onClick={() => {
            console.log('🔄 Forçando refetch da agenda...');
            refetch();
          }}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-3 bg-gray-800 rounded text-white text-sm">
        <div>🔍 Debug: Mostrando apenas orçamentos com status "Aguardando"</div>
        <div>📊 Total encontrado: {budgets.length} orçamentos</div>
        <div>📅 Com data: {budgets.filter(b => b.delivery_date).length}</div>
        <div>❓ Sem data: {budgets.filter(b => !b.delivery_date).length}</div>
      </div>

      {budgets.length === 0 ? (
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrega pendente</h3>
            <p className="text-gray-400">
              Apenas orçamentos "Aguardando" aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Orçamentos com data de entrega */}
          {budgets.filter(budget => budget.delivery_date).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Entregas Agendadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.filter(budget => budget.delivery_date).map((budget) => {
                  const deliveryStatus = getDeliveryStatus(budget.delivery_date);
                  
                  return (
                    <Card key={budget.id} className="bg-crm-card border-crm-border hover:bg-crm-card/80 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-white">{budget.title}</CardTitle>
                          <Badge className={deliveryStatus.color}>
                            {getStatusText(deliveryStatus.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{budget.client_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="h-4 w-4" />
                          <span>Entrega: {formatDeliveryDate(budget.delivery_date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Package className="h-4 w-4" />
                          <span>Quantidade: {getTotalQuantity(budget.orcamento_items)} itens</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-blue-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">{formatCurrency(budget.total)}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-crm-border">
                          <p className="text-gray-400 text-sm mb-2">Produtos:</p>
                          <div className="space-y-1">
                            {budget.orcamento_items?.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-sm text-gray-300 flex justify-between">
                                <span>{item.quantity || 0}x {item.product_name || 'Produto sem nome'}</span>
                                <span className="text-gray-400">
                                  {formatCurrency(item.subtotal || 0)}
                                </span>
                              </div>
                            ))}
                            {budget.orcamento_items && budget.orcamento_items.length > 3 && (
                              <div className="text-sm text-gray-400">
                                +{budget.orcamento_items.length - 3} produto(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Orçamentos sem data de entrega */}
          {budgets.filter(budget => !budget.delivery_date).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Orçamentos Sem Data de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.filter(budget => !budget.delivery_date).map((budget) => {
                  const deliveryStatus = getDeliveryStatus(budget.delivery_date);
                  
                  return (
                    <Card key={budget.id} className="bg-crm-card border-crm-border hover:bg-crm-card/80 transition-colors border-yellow-500/30">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-white">{budget.title}</CardTitle>
                          <Badge className={deliveryStatus.color}>
                            {getStatusText(deliveryStatus.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{budget.client_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Data de entrega não definida</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Package className="h-4 w-4" />
                          <span>Quantidade: {getTotalQuantity(budget.orcamento_items)} itens</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-blue-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">{formatCurrency(budget.total)}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-crm-border">
                          <p className="text-gray-400 text-sm mb-2">Produtos:</p>
                          <div className="space-y-1">
                            {budget.orcamento_items?.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-sm text-gray-300 flex justify-between">
                                <span>{item.quantity || 0}x {item.product_name || 'Produto sem nome'}</span>
                                <span className="text-gray-400">
                                  {formatCurrency(item.subtotal || 0)}
                                </span>
                              </div>
                            ))}
                            {budget.orcamento_items && budget.orcamento_items.length > 3 && (
                              <div className="text-sm text-gray-400">
                                +{budget.orcamento_items.length - 3} produto(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
