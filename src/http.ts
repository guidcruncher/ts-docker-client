import axios, { AxiosInstance } from 'axios';
import https from 'node:https';
import fs from 'node:fs';
import { DockerConfig } from './config';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { validateDockerConfig } from './validateconfig';

const execAsync = promisify(exec);
let client: AxiosInstance;

export function configureDocker(config: DockerConfig): void {
  validateDockerConfig(config);
  let baseURL = '';

  switch (config.transport) {
    case 'unix':
      baseURL = `http://unix:${config.socketPath || '/var/run/docker.sock'}:/v1.41`;
      break;
    case 'tcp':
    case 'https':
      baseURL = `${config.tls ? 'https' : 'http'}://${config.host}:${config.port}/v1.41`;
      break;
    case 'npipe':
      baseURL = `http://npipe:////./pipe/docker_engine:/v1.41`;
      break;
    case 'ssh':
      client = null!;
      return;
  }

  const httpsAgent = config.tls
    ? new https.Agent({
        ca: config.ca ? fs.readFileSync(config.ca) : undefined,
        cert: config.cert ? fs.readFileSync(config.cert) : undefined,
        key: config.key ? fs.readFileSync(config.key) : undefined,
        rejectUnauthorized: true,
      })
    : undefined;

  client = axios.create({
    baseURL,
    timeout: 5000,
    headers: config.headers,
    proxy: config.proxy
      ? {
          host: config.proxy.host,
          port: config.proxy.port,
          protocol: config.proxy.protocol || 'http',
        }
      : false,
    httpsAgent,
  });
}

async function request<T>(method: 'get' | 'post' | 'delete', url: string, data?: any, retries = 3): Promise<T> {
  if (!client) throw new Error('Docker client not configured or unsupported transport');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await client.request<T>({ method, url, data });
      return res.data;
    } catch (err: any) {
      if (attempt === retries - 1) throw new Error(`Docker API error: ${err.message}`);
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error('Unreachable code');
}

export const http = {
  get: <T>(url: string) => request<T>('get', url),
  post: <T>(url: string, data?: any) => request<T>('post', url, data),
  delete: <T>(url: string) => request<T>('delete', url),
};

export async function sshExec(cmd: string, host: string): Promise<string> {
  const fullCmd = `docker -H ssh://${host} ${cmd}`;
  const { stdout } = await execAsync(fullCmd);
  return stdout;
}
