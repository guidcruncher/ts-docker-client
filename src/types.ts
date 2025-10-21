export interface DockerVolume {
  Name: string;
  Driver: string;
  Mountpoint: string;
}

export interface DockerNetwork {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
}

export interface DockerSystemInfo {
  ID: string;
  Containers: number;
  Images: number;
  OperatingSystem: string;
  ServerVersion: string;
}

export interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
}

export interface DockerImage {
  Id: string;
  RepoTags: string[];
  Size: number;
  Created: number;
}

export interface DockerExecConfig {
  AttachStdout: boolean;
  AttachStderr: boolean;
  Cmd: string[];
}
