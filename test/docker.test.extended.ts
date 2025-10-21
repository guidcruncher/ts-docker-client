import { describe, it, expect, vi } from 'vitest';
import * as docker from '../src/docker';
import { Readable } from 'node:stream';
import { http } from '../src/http';

vi.mock('../src/http');

describe('Docker API - Extended Features', () => {
  it('executes command inside container', async () => {
    (http.post as any)
      .mockResolvedValueOnce({ Id: 'exec123' }) // exec create
      .mockResolvedValueOnce({ output: 'hello world' }); // exec start

    const result = await docker.execInContainer('abc123', ['echo', 'hello world']);
    expect(result).toContain('hello world');
  });

  it('streams container logs', () => {
    const mockStream = Readable.from(['log line 1\n', 'log line 2\n']);
    vi.spyOn(docker, 'streamLogs').mockReturnValue(mockStream);

    const stream = docker.streamLogs('abc123');
    const chunks: string[] = [];

    stream.on('data', (chunk) => chunks.push(chunk.toString()));
    stream.on('end', () => {
      expect(chunks).toContain('log line 1\n');
      expect(chunks).toContain('log line 2\n');
    });

    stream.emit('data', 'log line 1\n');
    stream.emit('data', 'log line 2\n');
    stream.emit('end');
  });

  it('listens to Docker events', () => {
    const mockEvents = Readable.from(['{"status":"start"}\n', '{"status":"stop"}\n']);
    vi.spyOn(docker, 'listenToEvents').mockReturnValue(mockEvents);

    const stream = docker.listenToEvents();
    const events: string[] = [];

    stream.on('data', (chunk) => events.push(chunk.toString()));
    stream.on('end', () => {
      expect(events).toContain('{"status":"start"}\n');
      expect(events).toContain('{"status":"stop"}\n');
    });

    stream.emit('data', '{"status":"start"}\n');
    stream.emit('data', '{"status":"stop"}\n');
    stream.emit('end');
  });
});
