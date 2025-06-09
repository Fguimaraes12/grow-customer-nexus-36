
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { Clientes } from "@/components/Clientes";
import { Produtos } from "@/components/Produtos";
import { Relatorios } from "@/components/Relatorios";
import { Orcamentos } from "@/components/Orcamentos";
import { LoginPanel } from "@/components/LoginPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPanel />} />
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/clientes" element={
            <Layout>
              <Clientes />
            </Layout>
          } />
          <Route path="/produtos" element={
            <Layout>
              <Produtos />
            </Layout>
          } />
          <Route path="/relatorios" element={
            <Layout>
              <Relatorios />
            </Layout>
          } />
          <Route path="/orcamentos" element={
            <Layout>
              <Orcamentos />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
