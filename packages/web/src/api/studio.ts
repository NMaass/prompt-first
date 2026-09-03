import type { EffectDraft, EffectReceipt, HostEffect, Mission, Workspace } from "@/studio/types"

export async function createWorkspace(mission: Mission) {
  return request<Workspace>("/studio/workspaces", { method: "POST", body: JSON.stringify(mission) })
}

export async function destroyWorkspace(id: string) {
  return request<{ removed: boolean }>(`/studio/workspaces/${id}`, { method: "DELETE" })
}

export async function registerEffect(workspaceId: string, effect: EffectDraft) {
  return request<HostEffect>("/studio/effects", {
    method: "POST",
    body: JSON.stringify({ ...effect, workspaceId, callId: undefined }),
  })
}

export async function approveEffect(effectId: string) {
  return request<{ token: string; expiresAt: string }>(`/studio/effects/${effectId}/approve`, { method: "POST" })
}

export async function executeEffect(effectId: string, idempotencyKey: string, approvalToken?: string) {
  return request<EffectReceipt>(`/studio/effects/${effectId}/execute`, {
    method: "POST",
    body: JSON.stringify({ idempotencyKey, approvalToken }),
  })
}

async function request<T>(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } })
  const body = (await response.json()) as unknown
  if (!response.ok) {
    const error = body && typeof body === "object" && "error" in body ? (body as { error?: unknown }).error : undefined
    throw new Error(typeof error === "string" ? error : `Request failed with ${response.status}`)
  }
  return body as T
}
