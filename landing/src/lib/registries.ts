export interface RegistryComponent {
  name: string;
  description: string;
  category: string;
  registry: string;
  command: string;
  url?: string;
  preview?: string;
}

export interface Registry {
  name: string;
  url: string;
  description: string;
  logo?: string;
  components: RegistryComponent[];
}

// shadcn/ui core components
const shadcnComponents: RegistryComponent[] = [
  // Form & Input
  { name: 'button', description: 'Button with variants', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add button' },
  { name: 'input', description: 'Text input component', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add input' },
  { name: 'textarea', description: 'Multi-line text input', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add textarea' },
  { name: 'select', description: 'Select dropdown', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add select' },
  { name: 'checkbox', description: 'Checkbox input', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add checkbox' },
  { name: 'radio-group', description: 'Radio button group', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add radio-group' },
  { name: 'switch', description: 'Toggle switch', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add switch' },
  { name: 'slider', description: 'Slider input', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add slider' },
  { name: 'form', description: 'Form with validation', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add form' },
  { name: 'label', description: 'Form label', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add label' },
  { name: 'calendar', description: 'Date calendar', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add calendar' },
  { name: 'date-picker', description: 'Date picker', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add date-picker' },
  { name: 'combobox', description: 'Searchable select', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add combobox' },
  { name: 'input-otp', description: 'OTP input', category: 'Form', registry: 'shadcn', command: 'npx shadcn@latest add input-otp' },

  // Layout & Navigation
  { name: 'accordion', description: 'Collapsible sections', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add accordion' },
  { name: 'tabs', description: 'Tabbed interface', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add tabs' },
  { name: 'navigation-menu', description: 'Navigation with dropdowns', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add navigation-menu' },
  { name: 'breadcrumb', description: 'Breadcrumb nav', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add breadcrumb' },
  { name: 'sidebar', description: 'Collapsible sidebar', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add sidebar' },
  { name: 'separator', description: 'Visual divider', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add separator' },
  { name: 'scroll-area', description: 'Custom scrollbar', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add scroll-area' },
  { name: 'resizable', description: 'Resizable panels', category: 'Layout', registry: 'shadcn', command: 'npx shadcn@latest add resizable' },

  // Overlays & Dialogs
  { name: 'dialog', description: 'Modal dialog', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add dialog' },
  { name: 'alert-dialog', description: 'Confirmation dialog', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add alert-dialog' },
  { name: 'sheet', description: 'Slide-out panel', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add sheet' },
  { name: 'drawer', description: 'Mobile drawer', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add drawer' },
  { name: 'popover', description: 'Floating popover', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add popover' },
  { name: 'tooltip', description: 'Hover tooltip', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add tooltip' },
  { name: 'hover-card', description: 'Hover preview card', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add hover-card' },
  { name: 'dropdown-menu', description: 'Dropdown menu', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add dropdown-menu' },
  { name: 'context-menu', description: 'Right-click menu', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add context-menu' },
  { name: 'command', description: 'Command palette', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add command' },
  { name: 'menubar', description: 'Horizontal menubar', category: 'Overlay', registry: 'shadcn', command: 'npx shadcn@latest add menubar' },

  // Feedback & Status
  { name: 'alert', description: 'Alert message', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add alert' },
  { name: 'sonner', description: 'Toast notifications', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add sonner' },
  { name: 'progress', description: 'Progress bar', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add progress' },
  { name: 'skeleton', description: 'Loading placeholder', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add skeleton' },
  { name: 'badge', description: 'Status badge', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add badge' },
  { name: 'spinner', description: 'Loading spinner', category: 'Feedback', registry: 'shadcn', command: 'npx shadcn@latest add spinner' },

  // Display & Media
  { name: 'card', description: 'Card container', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add card' },
  { name: 'avatar', description: 'User avatar', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add avatar' },
  { name: 'table', description: 'Data table', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add table' },
  { name: 'data-table', description: 'Advanced data table', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add data-table' },
  { name: 'chart', description: 'Charts (Recharts)', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add chart' },
  { name: 'carousel', description: 'Image carousel', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add carousel' },
  { name: 'aspect-ratio', description: 'Aspect ratio box', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add aspect-ratio' },
  { name: 'kbd', description: 'Keyboard shortcut', category: 'Display', registry: 'shadcn', command: 'npx shadcn@latest add kbd' },

  // Misc
  { name: 'collapsible', description: 'Collapsible section', category: 'Misc', registry: 'shadcn', command: 'npx shadcn@latest add collapsible' },
  { name: 'toggle', description: 'Toggle button', category: 'Misc', registry: 'shadcn', command: 'npx shadcn@latest add toggle' },
  { name: 'toggle-group', description: 'Toggle button group', category: 'Misc', registry: 'shadcn', command: 'npx shadcn@latest add toggle-group' },
  { name: 'pagination', description: 'Pagination controls', category: 'Misc', registry: 'shadcn', command: 'npx shadcn@latest add pagination' },
];

// Magic UI components (animation-focused)
const magicUIComponents: RegistryComponent[] = [
  { name: 'magic-card', description: 'Animated gradient card', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/magic-card"' },
  { name: 'shine-border', description: 'Shimmering border effect', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/shine-border"' },
  { name: 'border-beam', description: 'Animated border beam', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/border-beam"' },
  { name: 'meteors', description: 'Meteor shower effect', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/meteors"' },
  { name: 'particles', description: 'Particle background', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/particles"' },
  { name: 'globe', description: '3D interactive globe', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/globe"' },
  { name: 'marquee', description: 'Scrolling marquee', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/marquee"' },
  { name: 'dock', description: 'macOS dock effect', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/dock"' },
  { name: 'animated-beam', description: 'Connecting beam lines', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/animated-beam"' },
  { name: 'bento-grid', description: 'Bento box grid layout', category: 'Layout', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/bento-grid"' },
  { name: 'blur-fade', description: 'Blur fade animation', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/blur-fade"' },
  { name: 'text-animate', description: 'Text reveal animation', category: 'Animation', registry: 'magic-ui', command: 'npx shadcn@latest add "https://magicui.design/r/text-animate"' },
];

// Aceternity UI components
const aceternityComponents: RegistryComponent[] = [
  { name: 'background-beams', description: 'Animated background beams', category: 'Background', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/background-beams"' },
  { name: 'background-gradient', description: 'Animated gradient bg', category: 'Background', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/background-gradient"' },
  { name: 'spotlight', description: 'Spotlight hover effect', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/spotlight"' },
  { name: 'text-generate', description: 'AI text generation effect', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/text-generate-effect"' },
  { name: 'typewriter', description: 'Typewriter effect', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/typewriter-effect"' },
  { name: '3d-card', description: '3D tilt card effect', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/3d-card"' },
  { name: 'infinite-cards', description: 'Infinite scroll cards', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/infinite-moving-cards"' },
  { name: 'lamp', description: 'Lamp glow effect', category: 'Animation', registry: 'aceternity', command: 'npx shadcn@latest add "https://ui.aceternity.com/r/lamp"' },
];

export const registries: Registry[] = [
  {
    name: 'shadcn/ui',
    url: 'https://ui.shadcn.com',
    description: 'Core component library',
    components: shadcnComponents,
  },
  {
    name: 'Magic UI',
    url: 'https://magicui.design',
    description: 'Animation-focused components',
    components: magicUIComponents,
  },
  {
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

export function getAllComponents(): RegistryComponent[] {
  return registries.flatMap((r) => r.components);
}

export function generateInstallCommands(components: RegistryComponent[]): string[] {
  // Group by registry for cleaner output
  const grouped = components.reduce((acc, comp) => {
    if (!acc[comp.registry]) acc[comp.registry] = [];
    acc[comp.registry].push(comp);
    return acc;
  }, {} as Record<string, RegistryComponent[]>);

  const commands: string[] = [];

  // shadcn components can be batched
  if (grouped['shadcn']?.length) {
    const names = grouped['shadcn'].map((c) => c.name).join(' ');
    commands.push(`npx shadcn@latest add ${names}`);
  }

  // Other registries need individual commands
  Object.entries(grouped).forEach(([registry, comps]) => {
    if (registry !== 'shadcn') {
      comps.forEach((c) => commands.push(c.command));
    }
  });

  return commands;
}
