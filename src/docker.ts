import { http } from './http';
import { DockerContainer, DockerImage } from './types';
import { Readable } from 'node:stream';
import { request } from 'http';

import { http } from './http';
import { DockerContainer, DockerImage } from './types';

// 🧠 System Info
export async function getDockerInfo(): Promise<any> {
  return http.get('/info');
}

export async function getDockerVersion(): Promise<any> {
  return http.get('/version');
}

// 📦 Image Management
export async function inspectImage(name: string): Promise<any> {
  return http.get(`/images/${encodeURIComponent(name)}/json`);
}

export async function removeImage(name: string, force = false): Promise<void> {
  await http.delete(`/images/${encodeURIComponent(name)}?force=${force}`);
}

export async function pruneImages(): Promise<any> {
  return http.post('/images/prune');
}

// 🧰 Volume Management
export async function listVolumes(): Promise<any> {
  return http.get('/volumes');
}

export async function createVolume(name: string): Promise<any> {
  return http.post('/volumes/create', { Name: name });
}

export async function removeVolume(name: string): Promise<void> {
  await http.delete(`/volumes/${encodeURIComponent(name)}`);
}

export async function pruneVolumes(): Promise<any> {
  return http.post('/volumes/prune');
}

// 🌐 Network Management
export async function listNetworks(): Promise<any> {
  return http.get('/networks');
}

export async function createNetwork(name: string): Promise<any> {
  return http.post('/networks/create', { Name: name });
}

export async function removeNetwork(id: string): Promise<void> {
  await http.delete(`/networks/${encodeURIComponent(id)}`);
}

export async function pruneNetworks(): Promise<any> {
  return http.post('/networks/prune');
}


export async function listContainers(all = true): Promise<DockerContainer[]> {
  return http.get(`/containers/json?all=${all}`);
}

export async function startContainer(id: string): Promise<void> {
  await http.post(`/containers/${id}/start`);
}

export async function stopContainer(id: string): Promise<void> {
  await http.post(`/containers/${id}/stop`);
}

export async function removeContainer(id: string, force = false): Promise<void> {
  await http.delete(`/containers/${id}?force=${force}`);
}

export async function inspectContainer(id: string): Promise<any> {
  return http.get(`/containers/${id}/json`);
}

export async function listImages(): Promise<DockerImage[]> {
  return http.get(`/images/json`);
}

export async function pullImage(image: string): Promise<void> {
  await http.post(`/images/create?fromImage=${encodeURIComponent(image)}`);
}

export async function pruneContainers(): Promise<any> {
  return http.post(`/containers/prune`);
}

export function streamLogs(id: string): Readable {
  const options = {
    socketPath: '/var/run/docker.sock',
    path: `/v1.41/containers/${id}/logs?stdout=true&stderr=true&follow=true`,
    method: 'GET'
  };
  return request(options) as unknown as Readable;
}

export async function execInContainer(id: string, cmd: string[]): Promise<string> {
  const execConfig = {
    AttachStdout: true,
    AttachStderr: true,
    Cmd: cmd
  };
  const exec = await http.post(`/containers/${id}/exec`, execConfig);
  const execId = exec.Id;
  const res = await http.post(`/exec/${execId}/start`, { Detach: false, Tty: false });
  return JSON.stringify(res);
}

export function listenToEvents(): Readable {
  const options = {
    socketPath: '/var/run/docker.sock',
    path: `/v1.41/events`,
    method: 'GET'
  };
  return request(options) as unknown as Readable;
}

export async function listContainersFiltered(filters: Record<string, any>, all = true): Promise<DockerContainer[]> {
  const query = encodeURIComponent(JSON.stringify(filters));
  return http.get(`/containers/json?all=${all}&filters=${query}`);
}


export async function listVolumesFiltered(filters: Record<string, any>): Promise<any> {
  const query = encodeURIComponent(JSON.stringify(filters));
  return http.get(`/volumes?filters=${query}`);
}


export async function listNetworksFiltered(filters: Record<string, any>): Promise<any> {
  const query = encodeURIComponent(JSON.stringify(filters));
  return http.get(`/networks?filters=${query}`);
}


export async function listImagesFiltered(filters: Record<string, any>): Promise<DockerImage[]> {
  const query = encodeURIComponent(JSON.stringify(filters));
  return http.get(`/images/json?filters=${query}`);
}


export async function pruneImagesFiltered(filters: Record<string, any>): Promise<any> {
  return http.post(`/images/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
}

export async function pruneVolumesFiltered(filters: Record<string, any>): Promise<any> {
  return http.post(`/volumes/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
}

export async function pruneNetworksFiltered(filters: Record<string, any>): Promise<any> {
  return http.post(`/networks/prune?filters=${encodeURIComponent(JSON.stringify(filters))}`);
}


