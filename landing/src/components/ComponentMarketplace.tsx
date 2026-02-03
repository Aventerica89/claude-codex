import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ComponentCard } from './ComponentCard';
import { ScrollableContainer } from './ui/scrollable-container';
import {
  registries,
  categories,
  getAllComponents,
  generateInstallCommands,
  type RegistryComponentWithRegistry,
} from '@/lib/registries';

const ComponentMarketplace = () => {
  const [selectedRegistries, setSelectedRegistries] = useState<string[]>(['shadcn']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<RegistryComponentWithRegistry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const allComponents = useMemo(() => getAllComponents(), []);

  const filteredComponents = useMemo(() => {
    return allComponents.filter((comp) => {
      const matchesRegistry =
        selectedRegistries.length === 0 || selectedRegistries.includes(comp.registry);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(comp.category);
      const matchesSearch =
        searchQuery === '' ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRegistry && matchesCategory && matchesSearch;
    });
  }, [allComponents, selectedRegistries, selectedCategories, searchQuery]);

  const toggleRegistry = (registry: string) => {
    setSelectedRegistries((prev) =>
      prev.includes(registry) ? prev.filter((r) => r !== registry) : [...prev, registry]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleComponent = (componentId: string) => {
    const component = allComponents.find((c) => c.id === componentId);
    if (!component) return;

    setSelectedComponents((prev) => {
      const exists = prev.find((c) => c.id === componentId);
      if (exists) {
        return prev.filter((c) => c.id !== componentId);
      }
      return [...prev, component];
    });
  };

  const isSelected = (componentId: string) => {
    return selectedComponents.some((c) => c.id === componentId);
  };

  const installCommands = useMemo(() => {
    return generateInstallCommands(selectedComponents);
  }, [selectedComponents]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(installCommands.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearSelection = () => {
    setSelectedComponents([]);
  };

  return (
    <section id="components" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Component Marketplace
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Build Your Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select components from multiple registries and generate install commands.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Registries */}
            <div>
              <label className="text-sm font-medium mb-3 block">Registries</label>
              <div className="space-y-2">
                {registries.map((registry) => (
                  <label
                    key={registry.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRegistries.includes(registry.id)}
                      onChange={() => toggleRegistry(registry.id)}
                      className="w-4 h-4 rounded border-border bg-secondary accent-violet-500"
                    />
                    <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                      {registry.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {registry.components.length}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-3 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                        : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRegistries(['shadcn']);
                setSelectedCategories([]);
                setSearchQuery('');
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>

          {/* Components Grid */}
          <div className="lg:col-span-3">
            {/* Selection summary */}
            {selectedComponents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={copyToClipboard}>
                      {copied ? 'Copied!' : 'Copy Commands'}
                    </Button>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  {installCommands.map((cmd, i) => (
                    <div key={i} className="text-violet-400">
                      {cmd}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Grid */}
            <ScrollableContainer fadeClassName="from-background" maxHeight="700px">
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                <AnimatePresence mode="popLayout">
                  {filteredComponents.map((component) => (
                    <motion.div
                      key={component.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ComponentCard
                        component={component}
                        isSelected={isSelected(component.id)}
                        onToggle={toggleComponent}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollableContainer>

            {filteredComponents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No components match your filters
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComponentMarketplace;
