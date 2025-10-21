import { listenToEvents, inspectContainer } from './docker';
import { Readable } from 'node:stream';

type LabelChangeCallback = (id: string, labels: Record<string, string>) => void;

export function watchLabelChanges(onChange: LabelChangeCallback): void {
  const stream = listenToEvents();

  stream.on('data', async (chunk) => {
    try {
      const event = JSON.parse(chunk.toString());
      if (event.Type === 'container' && ['start', 'update'].includes(event.Action)) {
        const containerId = event.id;
        const metadata = await inspectContainer(containerId);
        const labels = metadata.Config?.Labels || {};
        onChange(containerId, labels);
      }
    } catch (err) {
      // Ignore malformed events
    }
  });

  stream.on('error', (err) => {
    console.error('Label watcher error:', err);
  });
}
