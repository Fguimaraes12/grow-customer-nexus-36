
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-crm-dark">
        <AppSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
