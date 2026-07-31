import { apiClient } from "@/lib/api/client"
import type { AnalyticsSnapshot } from "@/lib/api/types"

/** GET /dashboard/analytics — real Ask AI usage stats, accumulated
 * in-memory since the backend last started; see
 * app/services/analytics/analytics_service.py. */
export function getDashboardAnalytics(): Promise<AnalyticsSnapshot> {
  return apiClient.get<AnalyticsSnapshot>("/dashboard/analytics")
}
