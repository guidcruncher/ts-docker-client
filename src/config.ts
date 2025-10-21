export type DockerTransport = 'unix' | 'tcp' | 'https' | 'ssh' | 'npipe';

export interface DockerConfig {
  transport: DockerTransport;
  host?: string;
  port?: number;
  socketPath?: string;
  tls?: boolean;
  ssh?: string;

  // TLS options
  ca?: string;       // Path to CA cert
  cert?: string;     // Path to client cert
  key?: string;      // Path to client key

  // Proxy
  proxy?: {
    host: string;
    port: number;
    protocol?: 'http' | 'https';
  };

  // Custom headers
  headers?: Record<string, string>;
}

