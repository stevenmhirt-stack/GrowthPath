import { Link, useLocation } from "wouter";
import { navItems } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Menu, 
  LogOut,
  Printer,
  Lock,
  Shield,
  Settings
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { TutorialMenu } from "@/components/tutorial";
import { UpgradeModal } from "@/components/UpgradeModal";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Ignore errors
    }
    window.location.href = "/login";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-primary tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          GrowthPath
        </div>
      </div>
      
      <div className="flex-1 px-3 py-2">
        <nav className="grid gap-1">
          {navItems.map((item, index) => {
            const isActive = location === item.href;
            const isLocked = item.premium && !isPremium;
            
            const handleClick = (e: React.MouseEvent) => {
              if (isLocked) {
                e.preventDefault();
                setShowUpgradeModal(true);
              }
            };
            
            return (
              <Link 
                key={index} 
                href={isLocked ? "#" : item.href}
                onClick={handleClick}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }
                  ${isLocked ? "opacity-70" : ""}
                `}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
                {isLocked && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
              </Link>
            );
          })}
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${location === "/admin" 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }
              `}
              data-testid="link-admin"
            >
              <Shield className={`h-4 w-4 ${location === "/admin" ? "text-primary" : "text-muted-foreground"}`} />
              Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserDisplayName()} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium leading-none" data-testid="text-user-name">{getUserDisplayName()}</p>
              <p className="truncate text-xs text-muted-foreground mt-1" data-testid="text-user-email">{user?.email || "Member"}</p>
            </div>
          </div>
          <Separator className="my-3" />
          <Link 
            href="/account"
            className="flex items-center w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary px-3 rounded-md hover:bg-muted transition-colors"
            data-testid="link-account"
          >
            <Settings className="mr-2 h-3 w-3" />
            My Account
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-3 w-3" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-border/50 bg-card md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="w-full flex-1 md:w-auto md:flex-none">
             {/* Breadcrumbs could go here */}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search goals..."
                className="w-full bg-muted/40 pl-9 focus-visible:ring-1"
              />
            </div>
            <TutorialMenu />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.print()}
              title="Print this page"
              data-testid="button-print-page"
              className="print:hidden"
            >
              <Printer className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary animate-pulse" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
      
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
