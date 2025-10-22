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
  Labels?: Record<string, string>;
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
  Labels?: Record<string, string>;
}
  
export interface DockerImage {
  Id: string;
  RepoTags: string[];
  Created: number;
  Size: number;
  Labels?: Record<string, string>;
}

export interface DockerExecConfig {
  AttachStdout: boolean;
  AttachStderr: boolean;
  Cmd: string[];
}

export type FilterInput =
  | { label?: string | string[] }
  | { status?: string | string[] }
  | { name?: string | string[] }
  | { driver?: string | string[] }
  | { dangling?: boolean }
  | { type?: string | string[] };
