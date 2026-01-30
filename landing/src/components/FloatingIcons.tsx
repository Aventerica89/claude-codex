import { motion } from 'framer-motion';
import { integrations } from '@/lib/integrations';

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {integrations.map((integration, index) => {
        const angle = (index / integrations.length) * 2 * Math.PI;
        const radius = 280;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;

        return (
          <motion.div
            key={integration.name}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: x,
              y: y,
            }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          >
            <motion.div
              className="relative"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer group">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7"
                  fill={integration.color}
                >
                  <path d={integration.icon} />
                </svg>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded">
                  {integration.name}
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-xl opacity-30 blur-xl"
                style={{ backgroundColor: integration.color }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
