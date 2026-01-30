export interface RegistryComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies: string[];
  registrySource: "shadcn" | "radix" | "custom";
  complexity: "simple" | "intermediate" | "advanced";
  bundleSize: string;
  docsUrl: string;
  registryId?: string;
  command: string;
}

export interface Registry {
  id: string;
  name: string;
  url: string;
  description: string;
  logo?: string;
  components: RegistryComponent[];
}

// shadcn/ui core components
const shadcnComponents: RegistryComponent[] = [
  // Form & Input
  { id: 'button', name: 'Button', description: 'Displays a button or a component that looks like a button', category: 'Form', dependencies: ['@radix-ui/react-slot'], registrySource: 'shadcn', complexity: 'simple', bundleSize: '1.2', docsUrl: 'https://ui.shadcn.com/docs/components/button', command: 'npx shadcn@latest add button' },
  { id: 'input', name: 'Input', description: 'Displays a form input field or a component that looks like an input', category: 'Form', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.5', docsUrl: 'https://ui.shadcn.com/docs/components/input', command: 'npx shadcn@latest add input' },
  { id: 'textarea', name: 'Textarea', description: 'Displays a textarea or a component that looks like a textarea', category: 'Form', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.4', docsUrl: 'https://ui.shadcn.com/docs/components/textarea', command: 'npx shadcn@latest add textarea' },
  { id: 'select', name: 'Select', description: 'Displays a list of options for the user to pick from', category: 'Form', dependencies: ['@radix-ui/react-select'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '4.2', docsUrl: 'https://ui.shadcn.com/docs/components/select', command: 'npx shadcn@latest add select' },
  { id: 'checkbox', name: 'Checkbox', description: 'A control that allows the user to toggle between checked and not checked', category: 'Form', dependencies: ['@radix-ui/react-checkbox'], registrySource: 'radix', complexity: 'simple', bundleSize: '1.8', docsUrl: 'https://ui.shadcn.com/docs/components/checkbox', command: 'npx shadcn@latest add checkbox' },
  { id: 'radio-group', name: 'Radio Group', description: 'A set of checkable buttons where only one can be checked at a time', category: 'Form', dependencies: ['@radix-ui/react-radio-group'], registrySource: 'radix', complexity: 'simple', bundleSize: '2.1', docsUrl: 'https://ui.shadcn.com/docs/components/radio-group', command: 'npx shadcn@latest add radio-group' },
  { id: 'switch', name: 'Switch', description: 'A control that allows the user to toggle between two states', category: 'Form', dependencies: ['@radix-ui/react-switch'], registrySource: 'radix', complexity: 'simple', bundleSize: '1.5', docsUrl: 'https://ui.shadcn.com/docs/components/switch', command: 'npx shadcn@latest add switch' },
  { id: 'slider', name: 'Slider', description: 'An input where the user selects a value from within a given range', category: 'Form', dependencies: ['@radix-ui/react-slider'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '2.8', docsUrl: 'https://ui.shadcn.com/docs/components/slider', command: 'npx shadcn@latest add slider' },
  { id: 'form', name: 'Form', description: 'Building forms with React Hook Form and Zod validation', category: 'Form', dependencies: ['react-hook-form', '@hookform/resolvers', 'zod'], registrySource: 'custom', complexity: 'advanced', bundleSize: '8.5', docsUrl: 'https://ui.shadcn.com/docs/components/form', command: 'npx shadcn@latest add form' },
  { id: 'label', name: 'Label', description: 'Renders an accessible label associated with controls', category: 'Form', dependencies: ['@radix-ui/react-label'], registrySource: 'radix', complexity: 'simple', bundleSize: '0.8', docsUrl: 'https://ui.shadcn.com/docs/components/label', command: 'npx shadcn@latest add label' },
  { id: 'calendar', name: 'Calendar', description: 'A date field component that allows users to enter and edit date', category: 'Form', dependencies: ['react-day-picker', 'date-fns'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '12.4', docsUrl: 'https://ui.shadcn.com/docs/components/calendar', command: 'npx shadcn@latest add calendar' },

  // Layout & Navigation
  { id: 'accordion', name: 'Accordion', description: 'A vertically stacked set of interactive headings', category: 'Layout', dependencies: ['@radix-ui/react-accordion'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '3.2', docsUrl: 'https://ui.shadcn.com/docs/components/accordion', command: 'npx shadcn@latest add accordion' },
  { id: 'tabs', name: 'Tabs', description: 'A set of layered sections of content displayed one at a time', category: 'Layout', dependencies: ['@radix-ui/react-tabs'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '2.9', docsUrl: 'https://ui.shadcn.com/docs/components/tabs', command: 'npx shadcn@latest add tabs' },
  { id: 'navigation-menu', name: 'Navigation Menu', description: 'A collection of links for navigating websites', category: 'Layout', dependencies: ['@radix-ui/react-navigation-menu'], registrySource: 'radix', complexity: 'advanced', bundleSize: '5.8', docsUrl: 'https://ui.shadcn.com/docs/components/navigation-menu', command: 'npx shadcn@latest add navigation-menu' },
  { id: 'breadcrumb', name: 'Breadcrumb', description: 'Displays the path to the current resource using a hierarchy of links', category: 'Layout', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.9', docsUrl: 'https://ui.shadcn.com/docs/components/breadcrumb', command: 'npx shadcn@latest add breadcrumb' },
  { id: 'separator', name: 'Separator', description: 'Visually or semantically separates content', category: 'Layout', dependencies: ['@radix-ui/react-separator'], registrySource: 'radix', complexity: 'simple', bundleSize: '0.6', docsUrl: 'https://ui.shadcn.com/docs/components/separator', command: 'npx shadcn@latest add separator' },
  { id: 'scroll-area', name: 'Scroll Area', description: 'Augments native scroll functionality for custom styling', category: 'Layout', dependencies: ['@radix-ui/react-scroll-area'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '3.4', docsUrl: 'https://ui.shadcn.com/docs/components/scroll-area', command: 'npx shadcn@latest add scroll-area' },

  // Overlays & Dialogs
  { id: 'dialog', name: 'Dialog', description: 'A window overlaid on the primary window, rendering content underneath inert', category: 'Overlay', dependencies: ['@radix-ui/react-dialog'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '4.1', docsUrl: 'https://ui.shadcn.com/docs/components/dialog', command: 'npx shadcn@latest add dialog' },
  { id: 'alert-dialog', name: 'Alert Dialog', description: 'A modal dialog that interrupts the user with important content', category: 'Overlay', dependencies: ['@radix-ui/react-alert-dialog'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '3.8', docsUrl: 'https://ui.shadcn.com/docs/components/alert-dialog', command: 'npx shadcn@latest add alert-dialog' },
  { id: 'sheet', name: 'Sheet', description: 'Extends Dialog component to display content that slides in from screen edge', category: 'Overlay', dependencies: ['@radix-ui/react-dialog'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '4.2', docsUrl: 'https://ui.shadcn.com/docs/components/sheet', command: 'npx shadcn@latest add sheet' },
  { id: 'popover', name: 'Popover', description: 'Displays rich content in a portal, triggered by a button', category: 'Overlay', dependencies: ['@radix-ui/react-popover'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '3.5', docsUrl: 'https://ui.shadcn.com/docs/components/popover', command: 'npx shadcn@latest add popover' },
  { id: 'tooltip', name: 'Tooltip', description: 'A popup that displays information related to an element', category: 'Overlay', dependencies: ['@radix-ui/react-tooltip'], registrySource: 'radix', complexity: 'simple', bundleSize: '2.4', docsUrl: 'https://ui.shadcn.com/docs/components/tooltip', command: 'npx shadcn@latest add tooltip' },
  { id: 'dropdown-menu', name: 'Dropdown Menu', description: 'Displays a menu to the user with a list of actions', category: 'Overlay', dependencies: ['@radix-ui/react-dropdown-menu'], registrySource: 'radix', complexity: 'intermediate', bundleSize: '4.6', docsUrl: 'https://ui.shadcn.com/docs/components/dropdown-menu', command: 'npx shadcn@latest add dropdown-menu' },
  { id: 'command', name: 'Command', description: 'Fast, composable, unstyled command menu for React', category: 'Overlay', dependencies: ['cmdk'], registrySource: 'custom', complexity: 'advanced', bundleSize: '6.2', docsUrl: 'https://ui.shadcn.com/docs/components/command', command: 'npx shadcn@latest add command' },

  // Feedback & Status
  { id: 'alert', name: 'Alert', description: 'Displays a callout for user attention', category: 'Feedback', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.7', docsUrl: 'https://ui.shadcn.com/docs/components/alert', command: 'npx shadcn@latest add alert' },
  { id: 'sonner', name: 'Sonner', description: 'An opinionated toast component for React', category: 'Feedback', dependencies: ['sonner'], registrySource: 'custom', complexity: 'simple', bundleSize: '3.1', docsUrl: 'https://ui.shadcn.com/docs/components/sonner', command: 'npx shadcn@latest add sonner' },
  { id: 'progress', name: 'Progress', description: 'Displays an indicator showing the completion progress of a task', category: 'Feedback', dependencies: ['@radix-ui/react-progress'], registrySource: 'radix', complexity: 'simple', bundleSize: '1.4', docsUrl: 'https://ui.shadcn.com/docs/components/progress', command: 'npx shadcn@latest add progress' },
  { id: 'skeleton', name: 'Skeleton', description: 'Used to show a placeholder while content is loading', category: 'Feedback', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.3', docsUrl: 'https://ui.shadcn.com/docs/components/skeleton', command: 'npx shadcn@latest add skeleton' },
  { id: 'badge', name: 'Badge', description: 'Displays a badge or a component that looks like a badge', category: 'Feedback', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.4', docsUrl: 'https://ui.shadcn.com/docs/components/badge', command: 'npx shadcn@latest add badge' },

  // Display & Media
  { id: 'card', name: 'Card', description: 'Displays a card with header, content, and footer', category: 'Display', dependencies: [], registrySource: 'shadcn', complexity: 'simple', bundleSize: '0.8', docsUrl: 'https://ui.shadcn.com/docs/components/card', command: 'npx shadcn@latest add card' },
  { id: 'avatar', name: 'Avatar', description: 'An image element with a fallback for representing the user', category: 'Display', dependencies: ['@radix-ui/react-avatar'], registrySource: 'radix', complexity: 'simple', bundleSize: '1.6', docsUrl: 'https://ui.shadcn.com/docs/components/avatar', command: 'npx shadcn@latest add avatar' },
  { id: 'table', name: 'Table', description: 'A responsive table component', category: 'Display', dependencies: [], registrySource: 'shadcn', complexity: 'intermediate', bundleSize: '1.2', docsUrl: 'https://ui.shadcn.com/docs/components/table', command: 'npx shadcn@latest add table' },
  { id: 'data-table', name: 'Data Table', description: 'Powerful table with sorting, filtering, and pagination', category: 'Display', dependencies: ['@tanstack/react-table'], registrySource: 'custom', complexity: 'advanced', bundleSize: '14.8', docsUrl: 'https://ui.shadcn.com/docs/components/data-table', command: 'npx shadcn@latest add data-table' },
];

// Magic UI components (animation-focused)
const magicUIComponents: RegistryComponent[] = [
  { id: 'magic-animated-beam', name: 'Animated Beam', description: 'Connecting beam lines with animated gradients', category: 'Animation', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '2.1', docsUrl: 'https://magicui.design/docs/components/animated-beam', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/animated-beam"' },
  { id: 'magic-bento-grid', name: 'Bento Grid', description: 'Apple-style bento box grid layout', category: 'Layout', dependencies: [], registrySource: 'custom', complexity: 'intermediate', bundleSize: '1.8', docsUrl: 'https://magicui.design/docs/components/bento-grid', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/bento-grid"' },
  { id: 'magic-marquee', name: 'Marquee', description: 'Infinite scrolling marquee animation', category: 'Animation', dependencies: [], registrySource: 'custom', complexity: 'simple', bundleSize: '0.9', docsUrl: 'https://magicui.design/docs/components/marquee', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/marquee"' },
  { id: 'magic-shimmer-button', name: 'Shimmer Button', description: 'Button with animated shimmer effect', category: 'Animation', dependencies: [], registrySource: 'custom', complexity: 'simple', bundleSize: '0.6', docsUrl: 'https://magicui.design/docs/components/shimmer-button', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/shimmer-button"' },
  { id: 'magic-globe', name: 'Globe', description: '3D interactive globe visualization', category: 'Animation', dependencies: ['cobe', 'react-spring'], registrySource: 'custom', complexity: 'advanced', bundleSize: '18.2', docsUrl: 'https://magicui.design/docs/components/globe', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/globe"' },
  { id: 'magic-particles', name: 'Particles', description: 'Animated particle background effect', category: 'Background', dependencies: ['tsparticles'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '24.5', docsUrl: 'https://magicui.design/docs/components/particles', registryId: 'magicui', command: 'npx shadcn@latest add "https://magicui.design/r/particles"' },
];

// Aceternity UI components
const aceternityComponents: RegistryComponent[] = [
  { id: 'aceternity-3d-card', name: '3D Card', description: '3D tilt card with perspective effect', category: 'Animation', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '2.4', docsUrl: 'https://ui.aceternity.com/components/3d-card-effect', registryId: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/3d-card"' },
  { id: 'aceternity-spotlight', name: 'Spotlight', description: 'Mouse-following spotlight hover effect', category: 'Animation', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '1.8', docsUrl: 'https://ui.aceternity.com/components/spotlight', registryId: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/spotlight"' },
  { id: 'aceternity-background-beams', name: 'Background Beams', description: 'Animated SVG background beams', category: 'Background', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '3.2', docsUrl: 'https://ui.aceternity.com/components/background-beams', registryId: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/background-beams"' },
  { id: 'aceternity-text-generate', name: 'Text Generate', description: 'AI-style text generation animation', category: 'Animation', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'simple', bundleSize: '1.2', docsUrl: 'https://ui.aceternity.com/components/text-generate-effect', registryId: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/text-generate-effect"' },
  { id: 'aceternity-lamp', name: 'Lamp', description: 'Lamp glow lighting effect', category: 'Animation', dependencies: ['framer-motion'], registrySource: 'custom', complexity: 'intermediate', bundleSize: '2.1', docsUrl: 'https://ui.aceternity.com/components/lamp-effect', registryId: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/lamp"' },
];

export const registries: Registry[] = [
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    url: 'https://ui.shadcn.com',
    description: 'Core component library',
    components: shadcnComponents,
  },
  {
    id: 'magic-ui',
    name: 'Magic UI',
    url: 'https://magicui.design',
    description: 'Animation-focused components',
    components: magicUIComponents,
  },
  {
    id: 'aceternity',
    name: 'Aceternity UI',
    url: 'https://ui.aceternity.com',
    description: 'Modern animated components',
    components: aceternityComponents,
  },
];

export const categories = [
  'Form',
  'Layout',
  'Overlay',
  'Feedback',
  'Display',
  'Animation',
  'Background',
  'Misc',
];

export interface RegistryComponentWithRegistry extends RegistryComponent {
  registry: string;
}

export function getAllComponents(): RegistryComponentWithRegistry[] {
  return registries.flatMap((r) =>
    r.components.map((c) => ({ ...c, registry: r.id }))
  );
}

export function generateInstallCommands(components: RegistryComponentWithRegistry[]): string[] {
  const grouped = components.reduce((acc, comp) => {
    const key = comp.registryId || 'shadcn';
    if (!acc[key]) acc[key] = [];
    acc[key].push(comp);
    return acc;
  }, {} as Record<string, RegistryComponent[]>);

  const commands: string[] = [];

  if (grouped['shadcn']?.length) {
    const names = grouped['shadcn'].map((c) => c.id).join(' ');
    commands.push(`npx shadcn@latest add ${names}`);
  }

  Object.entries(grouped).forEach(([registry, comps]) => {
    if (registry !== 'shadcn') {
      comps.forEach((c) => commands.push(c.command));
    }
  });

  return commands;
}
