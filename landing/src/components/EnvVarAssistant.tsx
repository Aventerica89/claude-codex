import { motion, useReducedMotion } from 'framer-motion'

// Icon components
const CopyIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const KeyholeIcon = () => (
  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 13c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
  </svg>
)

const LightningIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

// Constants
const FEATURE_HIGHLIGHTS = [
  { value: '<1s', label: 'Key Detection' },
  { value: '20+', label: 'Providers' },
  { value: '100%', label: 'Secure' },
  { value: 'Zero', label: 'Config' },
]

const SUPPORTED_PLATFORMS = [
  'Vercel',
  'Cloudflare',
  'Netlify',
  'GitHub',
  'OpenAI',
  'Anthropic',
  'AWS',
  'Stripe',
]

const WORKFLOW_STEPS = [
  {
    id: 'copy',
    title: 'Copy Key',
    description: 'Auto-detected from clipboard',
    icon: <CopyIcon />,
    bgGradient: 'from-blue-500 to-cyan-500',
    borderHover: 'hover:border-violet-500/50',
    animation: { x: -50, delay: 0.2 },
  },
  {
    id: 'store',
    title: 'Secure Storage',
    description: 'Saved to 1Password instantly',
    icon: <KeyholeIcon />,
    bgGradient: 'from-violet-500 to-fuchsia-500',
    borderHover: 'hover:border-violet-500/30',
    animation: { y: 50, delay: 0.4 },
    featured: true,
  },
  {
    id: 'deploy',
    title: 'Auto-Fill',
    description: 'Deploy to any platform',
    icon: <LightningIcon />,
    bgGradient: 'from-green-500 to-emerald-500',
    borderHover: 'hover:border-green-500/50',
    animation: { x: 50, delay: 0.6 },
  },
]

export default function EnvVarAssistant() {
  const shouldReduceMotion = useReducedMotion()

  const particleAnimation = shouldReduceMotion
    ? {}
    : {
        animate: {
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-950/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-sm font-medium text-violet-400">Lightning Fast</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            Env Var Assistant
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Capture API keys instantly. Store securely. Deploy everywhere.
          </p>
        </motion.div>

        {/* Mockup 1 Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="text-sm font-medium text-muted-foreground/60">MOCKUP 1: Step Flow</span>
        </motion.div>

        {/* Mockup 1: Original step-based visual */}
        <div className="max-w-6xl mx-auto mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.id} className="relative">
                <motion.div
                  initial={{ opacity: 0, ...step.animation }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: step.animation.delay }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`bg-card rounded-2xl p-8 transition-all duration-300 ${step.borderHover} ${step.featured ? 'border-2 border-violet-500/50 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30' : 'border border-border'}`}>
                    <div className={`rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 mx-auto relative ${step.bgGradient} ${step.featured ? 'w-20 h-20' : 'w-16 h-16'}`}>
                      {step.icon}

                      {/* Speed particles - only for featured step */}
                      {step.featured && (
                        <motion.div
                          {...particleAnimation}
                          className="absolute inset-0 rounded-xl bg-violet-500/30 blur-xl"
                        />
                      )}
                    </div>
                    <h3 className={`text-center mb-2 ${step.featured ? 'text-xl font-bold text-violet-400' : 'text-lg font-semibold'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {step.description}
                    </p>
                  </div>

                  {/* Speed streak - not on last step */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: step.animation.delay + 0.2 }}
                      viewport={{ once: true }}
                      className="hidden md:block absolute top-1/2 -right-8 w-16 h-1 bg-gradient-to-r from-violet-500 to-transparent origin-left"
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-violet-500 motion-safe:animate-pulse" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Mockup 2 Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="text-sm font-medium text-muted-foreground/60">MOCKUP 2: Data Flow</span>
        </motion.div>

        {/* Mockup 2: High-speed data flow visualization */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="relative h-80 flex items-center justify-center">
            {/* Central 1Password Vault */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/50 border-4 border-violet-400/30">
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 13c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>

              {/* Pulsing rings */}
              {!shouldReduceMotion && (
                <>
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl border-2 border-violet-400"
                  />
                  <motion.div
                    animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl border-2 border-fuchsia-400"
                  />
                </>
              )}

              {/* Center label */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-sm font-bold text-violet-400">1Password Vault</span>
              </div>
            </motion.div>

            {/* Incoming API Key (left) */}
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute left-0 top-1/2 -translate-y-1/2"
            >
              <div className="relative">
                {/* API Key particle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <span className="text-xs font-mono text-white font-bold">sk-...</span>
                </div>

                {/* Motion trail */}
                {!shouldReduceMotion && (
                  <>
                    <motion.div
                      animate={{ scaleX: [0, 1, 0], x: [0, 100, 100] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-full top-1/2 -translate-y-1/2 h-1 w-40 bg-gradient-to-r from-cyan-400 to-transparent origin-left"
                    />
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ x: [0, 150], opacity: [1, 0] }}
                        transition={{
                          duration: 1,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                        className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400"
                        style={{ top: `${50 + (i - 1) * 15}%` }}
                      />
                    ))}
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Clipboard</p>
            </motion.div>

            {/* Outgoing to Platforms (right) */}
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <div className="relative flex flex-col gap-3">
                {['Vercel', 'CF', 'AWS'].map((platform, i) => (
                  <motion.div
                    key={platform}
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {platform}
                    </div>

                    {/* Incoming streak */}
                    {!shouldReduceMotion && (
                      <motion.div
                        animate={{ scaleX: [1, 0, 1], x: [-100, 0, -100] }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute right-full top-1/2 -translate-y-1/2 h-1 w-40 bg-gradient-to-l from-green-400 to-transparent origin-right"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Platforms</p>
            </motion.div>

            {/* Speed indicators */}
            {!shouldReduceMotion && (
              <>
                {/* Speed streaks background */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleX: [0, 1.5, 0],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                    style={{ top: `${20 + i * 12}%` }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Speed caption */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-violet-400">Keys captured and deployed in under 1 second</span>
            </div>
          </motion.div>

          {/* Explanatory Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto"
          >
            {/* Clipboard Detection Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Instant Detection</h4>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 motion-safe:animate-pulse"></div>
                      <span className="text-xs font-medium text-cyan-400">Auto-Capture</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The extension monitors your clipboard for API key patterns from 20+ providers. When you copy a key from OpenAI, Anthropic, AWS, or any supported service, it's instantly detected and ready to save.
                </p>
              </div>
            </div>

            {/* 1Password Security Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
              <div className="relative bg-card border-2 border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/60 transition-all duration-300 shadow-lg shadow-violet-500/10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 relative">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 13c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
                    </svg>
                    <div className="absolute -inset-1 rounded-xl border border-violet-400/30 motion-safe:animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Fort Knox Security</h4>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                      <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-violet-400">Encrypted</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All keys are stored in your 1Password vault with end-to-end encryption. Nothing touches browser storage or plain text files. Your secrets stay secret, protected by industry-leading security.
                </p>
              </div>
            </div>

            {/* Platform Deployment Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">One-Click Deploy</h4>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium text-green-400">Auto-Fill</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Navigate to Vercel, Cloudflare, Netlify, or GitHub. Click one button and your environment variables are instantly filled from 1Password. No copy-paste. No typos. Just deploy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="text-3xl font-bold text-violet-400 mb-2">{feature.value}</div>
              <div className="text-sm text-muted-foreground">{feature.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Supported platforms */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">WORKS WITH</p>
          <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
            {SUPPORTED_PLATFORMS.map((name) => (
              <div
                key={name}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:border-violet-500/50 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="https://github.com/Aventerica89/env-var-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-300 font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Get the Extension
          </a>
        </motion.div>
      </div>
    </section>
  )
}
