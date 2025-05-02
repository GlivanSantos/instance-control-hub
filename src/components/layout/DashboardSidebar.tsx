
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Home,
  Database,
  Users,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  current: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, title, current }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          to={href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
            current ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const { isAdmin, logout } = useAuth();
  
  // Define navigation items based on user role
  const navItems = [
    { href: '/dashboard', icon: Home, title: 'Dashboard' },
    { href: '/instances', icon: Database, title: 'Instances' },
  ];

  // Add admin-only navigation items
  const adminNavItems = isAdmin() ? [
    { href: '/clients', icon: Users, title: 'Clients' },
    { href: '/settings', icon: Settings, title: 'Settings' },
  ] : [];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-6 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">
              InstanceHub
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Control Center
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  current={pathname === item.href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    current={pathname === item.href}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="py-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
