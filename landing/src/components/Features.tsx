import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const features = [
  {
    title: '23 Custom Commands',
    description: 'Project management, git workflows, code quality, deployment, and more. All accessible via slash commands.',
    badge: 'Commands',
    badgeVariant: 'command' as const,
    items: ['/new-project', '/commit', '/code-review', '/deploy-check', '/tdd'],
  },
  {
    title: '12 Specialized Agents',
    description: 'Delegate complex tasks to purpose-built agents for planning, security review, testing, and documentation.',
    badge: 'Agents',
    badgeVariant: 'agent' as const,
    items: ['planner', 'security-reviewer', 'tdd-guide', 'architect', 'e2e-runner'],
  },
  {
    title: '11 Reusable Skills',
    description: 'Patterns and best practices for TypeScript, React, backend development, and security.',
    badge: 'Skills',
    badgeVariant: 'skill' as const,
    items: ['coding-standards', 'frontend-patterns', 'backend-patterns', 'security-review'],
  },
  {
    title: '12 Modular Rules',
    description: 'Configurable guidelines for CLI-first development, testing requirements, and git workflows.',
    badge: 'Rules',
    badgeVariant: 'rule' as const,
    items: ['cli-first', 'testing', 'git-workflow', 'security', 'coding-style'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for AI-assisted development, organized and ready to use.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full hover:border-violet-500/50 transition-colors group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.items.map((item) => (
                      <code
                        key={item}
                        className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground font-mono"
                      >
                        {item}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
