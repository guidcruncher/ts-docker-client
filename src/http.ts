// http.ts
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import https from 'node:https';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { DockerConfig } from './config';

const execAsync = promisify(exec);

export class HttpClient {
  private client: AxiosInstance | null = null;
  private readonly retries = 3;

  /**
   * Configures the internal Axios client based on Docker configuration.
   * @param config The Docker client configuration.
   */
  public configure(config: DockerConfig): void {
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
        this.client = null;
        return; // SSH transport uses a different execution path
      default:
        throw new Error(`Unsupported transport: ${config.transport}`);
    }

    const httpsAgent = config.tls
      ? new https.Agent({
          ca: config.ca ? fs.readFileSync(config.ca) : undefined,
          cert: config.cert ? fs.readFileSync(config.cert) : undefined,
          key: config.key ? fs.readFileSync(config.key) : undefined,
          rejectUnauthorized: true,
        })
      : undefined;

    this.client = axios.create({
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

  /**
   * Executes an HTTP request with retry logic.
   */
  private async request<T>(method: Method, url: string, data?: any): Promise<T> {
    if (!this.client) throw new Error('Docker client not configured or unsupported transport for HTTP');

    const config: AxiosRequestConfig = { method, url, data };

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const res = await this.client.request<T>(config);
        return res.data;
      } catch (err: any) {
        if (attempt === this.retries - 1) {
          throw new Error(`Docker API error: ${err.message}`);
        }
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    throw new Error('Unreachable code');
  }

  public get<T>(url: string): Promise<T> {
    return this.request<T>('get', url);
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('post', url, data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.request<T>('delete', url);
  }

  /**
   * Executes a command via SSH.
   */
  public async sshExec(cmd: string, host: string): Promise<string> {
    const fullCmd = `docker -H ssh://${host} ${cmd}`;
    const { stdout } = await execAsync(fullCmd);
    return stdout;
  }
}

export const http = new HttpClient();
