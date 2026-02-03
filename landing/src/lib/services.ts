export type ServiceStatus = 'connected' | 'warning' | 'offline' | 'unknown';
export type ServiceType = 'platform' | 'database' | 'tool' | 'integration';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  latencyMs: number | null;
  lastCheck: Date | null;
  icon: string;
  endpoint?: string;
}

// Mock data - will be replaced with real API calls
export const services: Service[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    type: 'platform',
    status: 'connected',
    latencyMs: 12,
    lastCheck: new Date(),
    icon: '▲',
    endpoint: 'https://api.vercel.com',
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'platform',
    status: 'connected',
    latencyMs: 45,
    lastCheck: new Date(),
    icon: 'GH',
    endpoint: 'https://api.github.com',
  },
  {
    id: '1password',
    name: '1Password',
    type: 'tool',
    status: 'connected',
    latencyMs: 8,
    lastCheck: new Date(),
    icon: '1P',
    endpoint: 'op://vault',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    type: 'database',
    status: 'connected',
    latencyMs: 23,
    lastCheck: new Date(),
    icon: 'SB',
    endpoint: 'https://supabase.co',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    type: 'platform',
    status: 'warning',
    latencyMs: 156,
    lastCheck: new Date(),
    icon: 'CF',
    endpoint: 'https://api.cloudflare.com',
  },
  {
    id: 'mcp-1password',
    name: 'MCP: 1Password',
    type: 'integration',
    status: 'connected',
    latencyMs: 5,
    lastCheck: new Date(),
    icon: 'M1',
  },
  {
    id: 'mcp-vercel',
    name: 'MCP: Vercel',
    type: 'integration',
    status: 'connected',
    latencyMs: 15,
    lastCheck: new Date(),
    icon: 'MV',
  },
  {
    id: 'mcp-cloudflare',
    name: 'MCP: Cloudflare',
    type: 'integration',
    status: 'offline',
    latencyMs: null,
    lastCheck: new Date(Date.now() - 3600000), // 1 hour ago
    icon: 'MC',
  },
];

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'connected':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'offline':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export function getStatusBgColor(status: ServiceStatus): string {
  switch (status) {
    case 'connected':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'warning':
      return 'Slow';
    case 'offline':
      return 'Offline';
    default:
      return 'Unknown';
  }
}
