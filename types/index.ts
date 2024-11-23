export interface Environment {
  local: string
  dev: string
  prod: string
}

export interface DomainGroup {
  id: string
  name: string
  environments?: Environment
}

export type EnvironmentType = keyof Environment
