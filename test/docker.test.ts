import { describe, it, expect, vi } from 'vitest';
import * as docker from '../src/docker';
import { mockContainers } from './mocks/docker.mock';
import { http } from '../src/http';

vi.mock('../src/http');

describe('Docker API', () => {
  it('lists containers', async () => {
    (http.get as any).mockResolvedValue(mockContainers);
    const containers = await docker.listContainers();
    expect(containers).toEqual(mockContainers);
  });

  it('starts a container', async () => {
    (http.post as any).mockResolvedValue(undefined);
    await expect(docker.startContainer('abc123')).resolves.toBeUndefined();
  });

  it('pulls an image', async () => {
    (http.post as any).mockResolvedValue(undefined);
    await expect(docker.pullImage('nginx')).resolves.toBeUndefined();
  });
});
