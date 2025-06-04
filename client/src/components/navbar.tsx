import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AuthModal } from "./auth-modal";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/wallet", label: "Wallet" },
    { href: "/orders", label: "Orders" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--gold)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-tan rounded-lg flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-charcoal">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                  <path d="M19.5 14.5L20.5 17.5L23.5 18.5L20.5 19.5L19.5 22.5L18.5 19.5L15.5 18.5L18.5 17.5L19.5 14.5Z" fill="currentColor"/>
                  <path d="M4.5 1.5L5.5 4.5L8.5 5.5L5.5 6.5L4.5 9.5L3.5 6.5L0.5 5.5L3.5 4.5L4.5 1.5Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-gold font-bold text-xl">InstaBoost Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${
                    location === link.href ? "text-gold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-cream/70">Balance</div>
                    <div className="text-gold font-semibold">
                      {formatCurrency(user.walletBalance)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-cream/70">UID</div>
                    <div className="text-cream text-sm font-mono">{user.uid}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-cream/70 hover:text-gold"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-outline"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-primary"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-cream hover:text-gold transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-charcoal border-t border-gold/20">
            <div className="px-4 py-2 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-cream hover:text-gold transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gold/20 pt-2 mt-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-cream hover:text-gold transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gold hover:bg-gold/10 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gold hover:bg-gold/10 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
