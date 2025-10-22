import path from 'node:path';
import fs from 'node:fs';
import { DockerConfig } from './config';

export function configFromEnv(): DockerConfig | null {
  const host = process.env.DOCKER_HOST;
  if (!host) return null;

  const url = new URL(host);
  const transport = url.protocol.replace(':', '') as DockerConfig['transport'];

  const config: DockerConfig = {
    transport,
    host: url.hostname,
    port: url.port ? parseInt(url.port) : undefined,
    socketPath: url.pathname || undefined,
    ssh: transport === 'ssh' ? (url.username==""?`${url.host}`:`${url.username}@${url.host}`)  : undefined,
  };

  if (process.env.DOCKER_TLS_VERIFY === '1') {
    config.tls = true;
    const certPath = process.env.DOCKER_CERT_PATH;
    if (certPath) {
      config.ca = path.join(certPath, 'ca.pem');
      config.cert = path.join(certPath, 'cert.pem');
      config.key = path.join(certPath, 'key.pem');
    }
  }

  return config;
}
