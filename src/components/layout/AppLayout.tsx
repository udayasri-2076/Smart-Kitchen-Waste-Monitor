import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { isDark, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Smart Kitchen Waste Monitor</span>
            </div>
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
