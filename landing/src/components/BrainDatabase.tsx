import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  brainData,
  searchBrain,
  type BrainItem,
  type BrainItemType,
} from '@/lib/brain-data';

const typeColors: Record<BrainItemType, { bg: string; text: string; border: string }> = {
  command: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  agent: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  skill: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  rule: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const typeIcons: Record<BrainItemType, string> = {
  command: 'M4 17l6-6-6-6M12 19h8',
  agent: 'M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0',
  skill: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  rule: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

const BrainDatabase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<BrainItemType[]>([]);
  const [selectedItem, setSelectedItem] = useState<BrainItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type'>('type');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const items = searchBrain(searchQuery, selectedTypes);
    return items.sort((a, b) => {
      if (sortBy === 'type') {
        const typeOrder = ['command', 'agent', 'skill', 'rule'];
        return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedTypes, sortBy]);

  const toggleType = (type: BrainItemType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedItem(null);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stats: { type: BrainItemType; count: number; label: string }[] = useMemo(() => [
    { type: 'command', count: brainData.filter((i) => i.type === 'command').length, label: 'Commands' },
    { type: 'agent', count: brainData.filter((i) => i.type === 'agent').length, label: 'Agents' },
    { type: 'skill', count: brainData.filter((i) => i.type === 'skill').length, label: 'Skills' },
    { type: 'rule', count: brainData.filter((i) => i.type === 'rule').length, label: 'Rules' },
  ], []);

  return (
    <section id="brain" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            The Brain
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Claude Codex Database
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Search and explore all commands, agents, skills, and rules.
            Press <kbd className="px-2 py-1 bg-secondary rounded text-sm font-mono">Cmd+K</kbd> to quick search.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.type} className="text-center">
                <div className={`text-2xl font-bold ${typeColors[stat.type].text}`}>
                  {stat.count}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, agents, skills, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'type')}
                className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
              >
                <option value="type">Sort by Type</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {(['command', 'agent', 'skill', 'rule'] as BrainItemType[]).map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  selectedTypes.includes(type) || selectedTypes.length === 0
                    ? `${typeColors[type].bg} ${typeColors[type].border} ${typeColors[type].text}`
                    : 'bg-card border-border text-muted-foreground opacity-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[type]} />
                </svg>
                <span className="capitalize">{type}s</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="max-w-6xl mx-auto relative">
          <div className="max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:border-violet-500/50 ${
                        selectedItem?.id === item.id ? 'border-violet-500' : ''
                      }`}
                      onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${typeColors[item.type].bg}`}>
                            <svg
                              className={`w-4 h-4 ${typeColors[item.type].text}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[item.type]} />
                            </svg>
                          </div>
                          <span className="font-mono text-sm font-medium">{item.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${typeColors[item.type].bg} ${typeColors[item.type].border} ${typeColors[item.type].text}`}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] bg-secondary rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {selectedItem?.id === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border"
                          >
                            {item.usage && (
                              <div className="mb-2">
                                <span className="text-xs text-muted-foreground">Usage:</span>
                                <code className="block mt-1 px-2 py-1 bg-secondary rounded text-xs font-mono text-violet-400">
                                  {item.usage}
                                </code>
                              </div>
                            )}
                            {item.category && (
                              <div>
                                <span className="text-xs text-muted-foreground">Category: </span>
                                <span className="text-xs">{item.category}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No items match your search
              </div>
            )}
          </div>
          {/* Fade out gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-secondary/30 to-transparent pointer-events-none" />
        </div>

        {/* Login prompt */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="inline-block p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Want to contribute?</h3>
            <p className="text-muted-foreground mb-4">
              Log in to add custom commands, agents, and skills to the database.
            </p>
            <Button>
              Log in with GitHub
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default BrainDatabase;
