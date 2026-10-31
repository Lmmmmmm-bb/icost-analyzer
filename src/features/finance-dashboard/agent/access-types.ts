export type AgentSupportStatus = "checking" | "ready" | "unsupported" | "error"

/** UI contract: upload revocation and the live ledger snapshot stay private. */
export type AgentAccessView = {
  enabled: boolean
  supportStatus: AgentSupportStatus
  supportError: string
  lastToolCall: string
  enable: () => void
  disable: () => void
}
