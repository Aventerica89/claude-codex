import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Components', href: '#components' },
    { name: 'Brain', href: '#brain' },
    { name: 'Docs', href: 'https://github.com/Aventerica89/claude-codex' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M6 10a6 6 0 0 0 12 0" />
              <path d="M12 16v6" />
              <path d="M8 22h8" />
              <circle cx="12" cy="6" r="1" fill="currentColor" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Claude Codex</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
          <Button size="sm" asChild>
            <a href="/dashboard">Get Started</a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              <Button className="w-full" asChild>
                <a href="/dashboard">Get Started</a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
