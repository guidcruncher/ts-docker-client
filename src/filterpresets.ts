import { buildDockerFilters } from './filterBuilder';

export const filterPresets = {
  runningContainers: buildDockerFilters({ status: 'running' }),
  stoppedContainers: buildDockerFilters({ status: 'exited' }),
  danglingImages: buildDockerFilters({ dangling: true }),
  bridgeNetworks: buildDockerFilters({ driver: 'bridge' }),
  labeledVolumes: (label: string) => buildDockerFilters({ label }),
};
