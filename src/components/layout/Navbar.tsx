import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "./sidebar-context";

function getIniciales(nombres: string, apellidos: string) {
  const nombresStr = nombres || "";
  const apellidosStr = apellidos || "";
  return `${nombresStr[0] ?? ""}${apellidosStr[0] ?? ""}`.toUpperCase();
}

interface NavbarProps {
  pageTitle: string;
}

export function Navbar({ pageTitle }: NavbarProps) {
  const { setMobileOpen } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="flex-1 truncate text-base font-semibold sm:text-lg">{pageTitle}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pr-1 outline-none ring-offset-background transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:rounded-md sm:pr-3 sm:py-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.nombres} />
              <AvatarFallback>{user ? getIniciales(user.nombres, user.apellidos) : "?"}</AvatarFallback>
            </Avatar>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">
                {user ? `${user.nombres} ${user.apellidos}` : "Usuario"}
              </span>
              <span className="block text-xs leading-tight text-muted-foreground">{user?.rol}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <span className="block text-sm font-medium">{user ? `${user.nombres} ${user.apellidos}` : ""}</span>
            <span className="block text-xs font-normal text-muted-foreground">{user?.correo}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
