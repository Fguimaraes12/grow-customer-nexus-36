import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { OrcamentoModal } from "./modals/OrcamentoModal";
import { useLogs } from "@/contexts/LogsContext";

export function Orcamentos() {
  const [budgets, setBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('orcamentos');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  const [produtos] = useState(() => {
    const savedProducts = localStorage.getItem('produtos');
    return savedProducts ? JSON.parse(savedProducts) : [
      { id: 1, name: "Banner 2x1m", price: "R$ 80,00" },
      { id: 2, name: "Adesivo Vinil", price: "R$ 25,00" },
      { id: 3, name: "Placa ACM", price: "R$ 150,00" },
    ];
  });

  const [clientes] = useState(() => {
    const savedClients = localStorage.getItem('clientes');
    return savedClients ? JSON.parse(savedClients) : [
      { id: 1, name: "João Silva" },
      { id: 2, name: "Maria Santos" },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const { addLog } = useLogs();

  useEffect(() => {
    localStorage.setItem('orcamentos', JSON.stringify(budgets));
  }, [budgets]);

  const formatCurrency = (value) => {
    if (typeof value === 'string' && value.includes('R$')) return value;
    if (typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    const numericValue = parseFloat(value.toString().replace(/[^
