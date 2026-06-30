'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Bell, Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">LearnHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
            {isAuthenticated() && (
              <>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/courses/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated() ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
                    <div className="p-2 border-b">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/dashboard" className="block px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                      <Link href="/profile" className="block px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                      <Link href="/settings" className="block px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="block px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => setUserMenuOpen(false)}>Admin</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent text-destructive">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link href="/courses" className="block px-2 py-2 text-sm hover:bg-accent rounded" onClick={() => setMenuOpen(false)}>Explore</Link>
            <Link href="/search" className="block px-2 py-2 text-sm hover:bg-accent rounded" onClick={() => setMenuOpen(false)}>Search</Link>
            {isAuthenticated() && (
              <>
                <Link href="/dashboard" className="block px-2 py-2 text-sm hover:bg-accent rounded" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link href="/courses/create" className="block px-2 py-2 text-sm hover:bg-accent rounded" onClick={() => setMenuOpen(false)}>Create Course</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
