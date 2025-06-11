
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Package, DollarSign } from "lucide-react";
import { format, isAfter, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Agenda() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    // Carrega orçamentos do localStorage
    const savedBudgets = localStorage.getItem('orcamentos');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }

    // Escuta por mudanças nos orçamentos
    const handleBudgetUpdate = () => {
      const updatedBudgets = localStorage.getItem('orcamentos');
      if (updatedBudgets) {
        setBudgets(JSON.parse(updatedBudgets));
      }
    };

    window.addEventListener('budgetCreated', handleBudgetUpdate);
    return () => window.removeEventListener('budgetCreated', handleBudgetUpdate);
  }, []);

  // Filtra apenas orçamentos "Aguardando" com data de entrega
  const pendingDeliveries = budgets.filter(budget => 
    budget.status === "Aguardando" && budget.deliveryDate
  );

  // Ordena por data de entrega
  const sortedDeliveries = pendingDeliveries.sort((a, b) => {
    return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
  });

  const getDeliveryStatus = (deliveryDate: string) => {
    const today = new Date();
    const delivery = parseISO(deliveryDate);
    
    if (isSameDay(delivery, today)) {
      return { status: "hoje", color: "bg-yellow-600 text-white" };
    } else if (isAfter(today, delivery)) {
      return { status: "atrasado", color: "bg-red-600 text-white" };
    } else {
      return { status: "agendado", color: "bg-green-600 text-white" };
    }
  };

  const formatDeliveryDate = (dateString: string) => {
    const date = parseISO(dateString);
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
      default:
        return "Agendado";
    }
  };

  const getTotalQuantity = (items: any[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-8 w-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Agenda de Entregas</h1>
      </div>

      {sortedDeliveries.length === 0 ? (
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrega pendente</h3>
            <p className="text-gray-400">
              Apenas orçamentos "Aguardando" com data de entrega aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDeliveries.map((budget) => {
            const deliveryStatus = getDeliveryStatus(budget.deliveryDate);
            
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
                    <span className="font-medium">{budget.client}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>Entrega: {formatDeliveryDate(budget.deliveryDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Package className="h-4 w-4" />
                    <span>Quantidade: {getTotalQuantity(budget.items)} itens</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">{budget.total}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-crm-border">
                    <p className="text-gray-400 text-sm mb-2">Produtos:</p>
                    <div className="space-y-1">
                      {budget.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm text-gray-300 flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-gray-400">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(parseFloat(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {budget.items.length > 3 && (
                        <div className="text-sm text-gray-400">
                          +{budget.items.length - 3} produto(s)
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
