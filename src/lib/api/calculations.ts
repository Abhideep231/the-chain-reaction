import { apiClient } from "@/lib/api/client"
import type { CalculationRequest, CalculationResponse, ChainSelectionInput } from "@/lib/api/types"

/** POST /calculations — deterministic chain-selection calculation, plus
 * an optional Claude explanation of the already-computed result. */
export function runChainSelectionCalculation(
  inputs: ChainSelectionInput
): Promise<CalculationResponse> {
  const request: CalculationRequest = { calculation_type: "chain_selection", inputs }
  return apiClient.post<CalculationResponse>("/calculations", request)
}
