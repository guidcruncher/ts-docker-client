import fs from 'node:fs';
import { DockerConfig } from './config';

export function validateDockerConfig(config: DockerConfig): void {
  const errors: string[] = [];

  switch (config.transport) {
    case 'unix':
      if (!config.socketPath) {
        config.socketPath = '/var/run/docker.sock';
      }
      if (!fs.existsSync(config.socketPath)) {
        errors.push(`Unix socket not found at ${config.socketPath}`);
      }
      break;

    case 'tcp':
      if (!config.host || !config.port) {
        errors.push('TCP transport requires both host and port');
      }
      break;

    case 'https':
      if (!config.host || !config.port) {
        errors.push('HTTPS transport requires both host and port');
      }
      if (!config.ca || !config.cert || !config.key) {
        errors.push('HTTPS transport requires ca, cert, and key file paths');
      } else {
        for (const [label, file] of Object.entries({
          ca: config.ca,
          cert: config.cert,
          key: config.key,
        })) {
          if (!fs.existsSync(file)) {
            errors.push(`TLS file not found: ${label} at ${file}`);
          }
        }
      }
      break;

    case 'npipe':
      if (process.platform !== 'win32') {
        errors.push('Named pipe transport is only supported on Windows');
      }
      break;

    case 'ssh':
      if (!config.ssh) {
        errors.push('SSH transport requires ssh user@host string');
      }
      break;

    default:
      errors.push(`Unsupported transport: ${config.transport}`);
  }

  if (errors.length > 0) {
    throw new Error(`Docker config validation failed:\n- ${errors.join('\n- ')}`);
  }
}
