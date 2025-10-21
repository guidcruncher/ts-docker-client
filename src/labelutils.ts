import { DockerContainer, DockerImage } from './types';

// Extract labels from container metadata
export function extractContainerLabels(container: DockerContainer): Record<string, string> {
  return container.Labels || {};
}

// Extract labels from image metadata
export function extractImageLabels(image: DockerImage): Record<string, string> {
  return image.Labels || {};
}

// Flatten label sets from multiple items
export function collectUniqueLabels(items: Array<{ Labels?: Record<string, string> }>): string[] {
  const labelSet = new Set<string>();
  for (const item of items) {
    if (item.Labels) {
      for (const [key, value] of Object.entries(item.Labels)) {
        labelSet.add(`${key}=${value}`);
      }
    }
  }
  return Array.from(labelSet);
}
