export interface Environment {
  [key: string]: {
    domain: string | null
    protocol: string
  } | null
}

export interface DomainGroup {
  id: string
  name: string
  environments: Environment
  envOrder: string[]
}

export const PROTOCOLS = ["http://", "https://"] as const
export type Protocol = (typeof PROTOCOLS)[number]
