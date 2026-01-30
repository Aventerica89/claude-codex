import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { integrations } from '@/lib/integrations';

const Integrations = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Integrations
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Works With Your Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pre-configured MCP servers and CLI tools for seamless integration.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.05 }}
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              className="group relative p-6 rounded-xl bg-card border border-border hover:border-violet-500/50 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${integration.color}15` }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill={integration.color}>
                  <path d={integration.icon} />
                </svg>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-violet-400 transition-colors">
                {integration.name}
              </h3>
              <p className="text-sm text-muted-foreground">{integration.description}</p>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${integration.color}10 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;
