import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  KeyRound,
  ChevronLeft,
  Image,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  forceDark?: boolean;
}

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/homepage-editor", label: "Homepage Editor", icon: Palette },
  { path: "/admin/blog", label: "Blog", icon: FileText },
  { path: "/admin/media", label: "Médias", icon: Image },
  { path: "/admin/assets", label: "Assets", icon: Palette },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children, forceDark = false }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className={`min-h-screen flex bg-background ${forceDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/en" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <h1 className="text-xl font-bold text-foreground mt-2">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <Link
            to="/admin/change-password"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === "/admin/change-password"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
