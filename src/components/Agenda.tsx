
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
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

  // Filtra apenas orçamentos com data de entrega
  const budgetsWithDelivery = budgets.filter(budget => budget.deliveryDate);

  // Ordena por data de entrega
  const sortedBudgets = budgetsWithDelivery.sort((a, b) => {
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

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-8 w-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Agenda de Entregas</h1>
      </div>

      {sortedBudgets.length === 0 ? (
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrega agendada</h3>
            <p className="text-gray-400">
              As entregas dos orçamentos com data de entrega aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBudgets.map((budget) => {
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
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span>{budget.client}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>Entrega: {formatDeliveryDate(budget.deliveryDate)}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-crm-border">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total</span>
                      <span className="text-blue-400 font-semibold">{budget.total}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-sm">Status</span>
                      <Badge variant="outline" className="text-xs">
                        {budget.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-gray-400 text-sm">Itens:</p>
                    <div className="mt-1 space-y-1">
                      {budget.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm text-gray-300">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                      {budget.items.length > 2 && (
                        <div className="text-sm text-gray-400">
                          +{budget.items.length - 2} item(s)
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
