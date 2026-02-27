import {
  LayoutDashboard,
  Upload,
  BrainCircuit,
  Settings2,
  CloudSun,
  FileBarChart,
  Leaf,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useData } from '@/contexts/DataContext';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Data Upload', url: '/upload', icon: Upload },
  { title: 'Predictions', url: '/predictions', icon: BrainCircuit },
  { title: 'Optimization', url: '/optimization', icon: Settings2 },
  { title: 'Weather Report', url: '/weather', icon: CloudSun },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isDataReady } = useData();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="gradient-sidebar h-full flex flex-col">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display font-bold text-sm text-sidebar-foreground">Smart Kitchen</h2>
              <p className="text-[10px] text-sidebar-foreground/60">Waste Monitor</p>
            </div>
          )}
        </div>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider mb-1">
              {!collapsed && 'Navigation'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active = isActive(item.url);
                  const disabled = !isDataReady && item.url !== '/' && item.url !== '/upload';

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={disabled ? '#' : item.url}
                          end
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                            active
                              ? 'bg-sidebar-primary/20 text-sidebar-primary'
                              : disabled
                              ? 'text-sidebar-foreground/25 cursor-not-allowed'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                          }`}
                          activeClassName=""
                          onClick={(e: React.MouseEvent) => disabled && e.preventDefault()}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && disabled && (
                            <span className="ml-auto text-[9px] bg-sidebar-accent px-1.5 py-0.5 rounded text-sidebar-foreground/40">
                              No Data
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {!collapsed && (
          <SidebarFooter className="p-4">
            <div className="glass-card p-3 bg-sidebar-accent/30 border-sidebar-border">
              <p className="text-[10px] text-sidebar-foreground/50">
                {isDataReady ? '✅ All datasets loaded' : '⚠️ Upload Sales & Weather data'}
              </p>
            </div>
          </SidebarFooter>
        )}
      </div>
    </Sidebar>
  );
}
