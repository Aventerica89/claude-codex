"use client"

import { motion } from "framer-motion"

// Brand colors
const brands = {
  vercel: {
    name: "Vercel",
    primary: "#0070F3",
    dark: "#171717",
    light: "#FAFAFA",
  },
  cloudflare: {
    name: "Cloudflare",
    primary: "#F38020",
    secondary: "#FAAE40",
    dark: "#404041",
  },
}

const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Instant Detection",
    badge: "Auto-Capture",
    badgeColor: "bg-emerald-500",
    description: "Monitors your clipboard for API key patterns from 20+ providers. Copy a key from Anthropic, OpenAI, or AWS and it's instantly ready to save.",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Fort Knox Security",
    badge: "Encrypted",
    badgeColor: "bg-violet-500",
    description: "All keys stored in your 1Password vault with end-to-end encryption. Nothing touches browser storage or plain text files. Industry-leading protection.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "One-Click Deploy",
    badge: "Auto-Fill",
    badgeColor: "bg-emerald-500",
    description: "Navigate to Vercel, Cloudflare, Netlify, or GitHub. Click one button and your environment variables are instantly filled from 1Password. No copy-paste.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
]

export function EnvVarAssistant() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-950/10 to-background" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-4">
            New Product
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            EnvVarAssistant
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop manually copying environment variables. Securely sync secrets from 1Password to any platform.
          </p>
        </motion.div>

        {/* Platform Env Setup Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
            {/* Vercel Env Setup Mockup */}
            <div className="w-full max-w-md rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-[#171717]">
                <svg className="w-5 h-5 text-white" viewBox="0 0 76 65" fill="currentColor">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="text-sm font-medium text-white">Environment Variables</span>
              </div>
              <div className="p-4 space-y-3 bg-[#0a0a0a]">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Key</label>
                  <input
                    type="text"
                    value="ANTHROPIC_API_KEY"
                    readOnly
                    className="w-full px-3 py-2 bg-[#171717] border border-gray-800 rounded-md text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Value</label>
                  <div className="relative">
                    <input
                      type="password"
                      value="sk-ant-api03-xxxxxxxxxxxx"
                      readOnly
                      className="w-full px-3 py-2 bg-[#171717] border border-gray-800 rounded-md text-sm text-white pr-24"
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded flex items-center gap-1.5"
                      style={{ backgroundColor: '#0070F3', color: 'white' }}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      1Password
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium">
                    Save
                  </button>
                  <button className="px-4 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-md text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Cloudflare Env Setup Mockup */}
            <div className="w-full max-w-md rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-border flex items-center gap-3" style={{ backgroundColor: '#404041' }}>
                <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                  <path d="M42.5 47H16.5C15.7 47 15 46.3 15 45.5C15 44.7 15.7 44 16.5 44H42.5C48.8 44 54 38.8 54 32.5C54 26.4 49.1 21.3 43 21C42.5 14.2 36.8 9 30 9C23.9 9 18.7 13.2 17.3 19C11.3 19.5 6.5 24.6 6.5 30.8C6.5 37.3 11.7 42.5 18.2 42.5" stroke="#F38020" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M30 25V45M30 25L24 31M30 25L36 31" stroke="#FAAE40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-white">Workers Environment Variables</span>
              </div>
              <div className="p-4 space-y-3 bg-[#1a1a1a]">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Variable name</label>
                  <input
                    type="text"
                    value="OPENAI_API_KEY"
                    readOnly
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Value</label>
                  <div className="relative">
                    <input
                      type="password"
                      value="sk-proj-xxxxxxxxxxxx"
                      readOnly
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-sm text-white pr-24"
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded flex items-center gap-1.5"
                      style={{ backgroundColor: '#F38020', color: 'white' }}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      1Password
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" className="rounded border-gray-600" defaultChecked />
                  <span className="text-xs text-gray-400">Encrypt</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ backgroundColor: '#F38020' }}
                  >
                    Add variable
                  </button>
                  <button className="px-4 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-md text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 1Password CLI Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16 flex justify-center"
        >
          <div className="relative">
            {/* Terminal Window */}
            <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              {/* Terminal Header */}
              <div className="px-4 py-3 bg-[#1e1e1e] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-gray-500 ml-2">Terminal</span>
              </div>
              {/* Terminal Body */}
              <div className="p-4 bg-[#0d1117] font-mono text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-emerald-400">$</span>
                  <span>op inject -i .env.tpl -o .env.local</span>
                </div>
                <div className="mt-3 text-gray-500 text-xs">
                  Injecting secrets from 1Password...
                </div>
              </div>
            </div>

            {/* Auth Modal Overlay */}
            <div className="absolute top-8 -right-4 w-72 rounded-xl bg-[#1c1c1e] border border-gray-700 shadow-2xl overflow-hidden">
              <div className="p-4 text-center">
                <h4 className="text-white font-medium mb-3">Authorize Access for 1Password</h4>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2d2d2f] flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z"/>
                    </svg>
                  </div>
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <div className="w-10 h-10 rounded-full bg-[#0572ec] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-4">Allow <strong className="text-white">Terminal</strong> to access the CLI</p>
                <div className="bg-[#2d2d2f] rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm">
                    JB
                  </div>
                  <span className="text-white text-sm">Jordan Baker</span>
                </div>
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <input type="checkbox" className="rounded border-gray-600" />
                  <span className="text-gray-400 text-xs">Approve for all applications</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#3d3d3f] text-white rounded-lg text-sm">
                    Deny
                  </button>
                  <button className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    Authorize with Touch ID
                    <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards - Balanced Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
              <div className="relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${feature.iconBg}`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${feature.badgeColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      {feature.badge}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
            Get Started with EnvVarAssistant
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default EnvVarAssistant
