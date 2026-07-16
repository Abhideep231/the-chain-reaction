import { apiClient } from "@/lib/api/client"
import type { AdminStatusResponse, VectorStoreStatus } from "@/lib/api/types"

export function getAdminStatus(): Promise<AdminStatusResponse> {
  return apiClient.get<AdminStatusResponse>("/admin/status")
}

export function getVectorStoreStatus(): Promise<VectorStoreStatus> {
  return apiClient.get<VectorStoreStatus>("/vectorstore/status")
}
