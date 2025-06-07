
import { LayoutDashboard, Users, FileText, DollarSign, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: FileText,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: DollarSign,
  },
  {
    title: "Orçamentos",
    url: "/orcamentos",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-crm-dark border-crm-border">
      <SidebarHeader className="border-b border-crm-border">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white">Fortal CRM</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-crm-card text-gray-300 hover:text-white"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-crm-border">
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-white">Proprietário</p>
            <p className="text-xs text-gray-400">Proprietário</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
