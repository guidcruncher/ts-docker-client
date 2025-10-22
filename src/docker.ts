// docker.ts
import { HttpClient } from './http';
import { DockerContainer, DockerImage, DockerExecConfig, DockerSystemInfo, DockerVolume, DockerNetwork } from './types';
import { Readable } from 'node:stream';
import { request } from 'http';
import { DockerConfig } from './config';
import { validateDockerConfig } from './validateconfig';

// ｧ Main Docker Client Class
export class DockerClient {
  private readonly http: HttpClient;
  private config: DockerConfig | null = null;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Configures the client, validates the configuration, and sets up the internal HTTP client.
   * @param config The Docker configuration.
   */
  public configure(config: DockerConfig): void {
    validateDockerConfig(config);
    this.config = config;
    this.http.configure(config);
  }

  /**
   * Helper for non-HTTP requests (e.g., streaming logs/events).
   */
  private streamRequest(path: string): Readable {
    if (this.config?.transport !== 'unix') {
        throw new Error('Stream requests (logs/events) currently only support "unix" transport.');
    }
    const options = {
      socketPath: this.config.socketPath || '/var/run/docker.sock',
      path: `/v1.41${path}`,
      method: 'GET',
    };
    return request(options) as unknown as Readable;
  }

  // -----------------------------------------------------------------------
  // 🐳 System Info
  // -----------------------------------------------------------------------

  public async getInfo(): Promise<DockerSystemInfo> {
    return this.http.get('/info');
  }

  public async getVersion(): Promise<any> {
    return this.http.get('/version');
  }

  // -----------------------------------------------------------------------
  // 📦 Container Management
  // -----------------------------------------------------------------------

  public async listContainers(all = true): Promise<DockerContainer[]> {
    return this.http.get(`/containers/json?all=${all}`);
  }

  public async listContainersFiltered(filters: Record<string, any>, all = true): Promise<DockerContainer[]> {
    const query = encodeURIComponent(JSON.stringify(filters));
    return this.http.get(`/containers/json?all=${all}&filters=${query}`);
  }

  public async inspectContainer(id: string): Promise<any> {
    return this.http.get(`/containers/${id}/json`);
  }

  public async startContainer(id: string): Promise<void> {
    await this.http.post(`/containers/${id}/start`);
  }

  public async stopContainer(id: string): Promise<void> {
    await this.http.post(`/containers/${id}/stop`);
  }

  public async removeContainer(id: string, force = false): Promise<void> {
    await this.http.delete(`/containers/${id}?force=${force}`);
  }

  public async pruneContainers(): Promise<any> {
    return this.http.post(`/containers/prune`);
  }

  public streamLogs(id: string): Readable {
    const path = `/containers/${id}/logs?stdout=true&stderr=true&follow=true`;
    return this.streamRequest(path);
  }

  public async execInContainer(id: string, cmd: string[]): Promise<string> {
    const execConfig: DockerExecConfig = {
      AttachStdout: true,
      AttachStderr: true,
      Cmd: cmd
    };
    const exec = await this.http.post<{ Id: string }>(`/containers/${id}/exec`, execConfig);
    const execId = exec.Id;
    const res = await this.http.post(`/exec/${execId}/start`, { Detach: false, Tty: false });
    return JSON.stringify(res);
  }

  // -----------------------------------------------------------------------
  // 🖼️ Image Management
  // -----------------------------------------------------------------------

  public async listImages(): Promise<DockerImage[]> {
    return this.http.get(`/images/json`);
  }

  public async listImagesFiltered(filters: Record<string, any>): Promise<DockerImage[]> {
    const query = encodeURIComponent(JSON.stringify(filters));
    return this.http.get(`/images/json?filters=${query}`);
  }

  public async inspectImage(name: string): Promise<any> {
    return this.http.get(`/images/${encodeURIComponent(name)}/json`);
  }

  public async pullImage(image: string): Promise<void> {
    await this.http.post(`/images/create?fromImage=${encodeURIComponent(image)}`);
  }

  public async removeImage(name: string, force = false): Promise<void> {
    await this.http.delete(`/images/${encodeURIComponent(name)}?force=${force}`);
  }

  public async pruneImages(): Promise<any> {
    return this.http.post('/images/prune');
  }

  public async pruneImagesFiltered(filters: Record<string, any>): Promise<any> {
    return this.http.post(`/images/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
  }

  // -----------------------------------------------------------------------
  // 💾 Volume Management
  // -----------------------------------------------------------------------

  public async listVolumes(): Promise<{ Volumes: DockerVolume[] }> {
    return this.http.get('/volumes');
  }

  public async listVolumesFiltered(filters: Record<string, any>): Promise<{ Volumes: DockerVolume[] }> {
    const query = encodeURIComponent(JSON.stringify(filters));
    return this.http.get(`/volumes?filters=${query}`);
  }

  public async createVolume(name: string): Promise<DockerVolume> {
    return this.http.post('/volumes/create', { Name: name });
  }

  public async removeVolume(name: string): Promise<void> {
    await this.http.delete(`/volumes/${encodeURIComponent(name)}`);
  }

  public async pruneVolumes(): Promise<any> {
    return this.http.post('/volumes/prune');
  }

  public async pruneVolumesFiltered(filters: Record<string, any>): Promise<any> {
    return this.http.post(`/volumes/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
  }

  // -----------------------------------------------------------------------
  // 🌐 Network Management
  // -----------------------------------------------------------------------

  public async listNetworks(): Promise<DockerNetwork[]> {
    return this.http.get('/networks');
  }

  public async listNetworksFiltered(filters: Record<string, any>): Promise<DockerNetwork[]> {
    const query = encodeURIComponent(JSON.stringify(filters));
    return this.http.get(`/networks?filters=${query}`);
  }

  public async createNetwork(name: string): Promise<any> {
    return this.http.post('/networks/create', { Name: name });
  }

  public async removeNetwork(id: string): Promise<void> {
    await this.http.delete(`/networks/${encodeURIComponent(id)}`);
  }

  public async pruneNetworks(): Promise<any> {
    return this.http.post('/networks/prune');
  }

  public async pruneNetworksFiltered(filters: Record<string, any>): Promise<any> {
    return this.http.post(`/networks/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
  }

  // -----------------------------------------------------------------------
  // 📢 Events
  // -----------------------------------------------------------------------

  public listenToEvents(): Readable {
    return this.streamRequest('/events');
  }
}

// Export a singleton instance of the client
export const dockerClient = new DockerClient(new HttpClient());
