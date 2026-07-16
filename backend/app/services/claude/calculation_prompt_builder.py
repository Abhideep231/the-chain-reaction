"""Builds the system and user prompts sent to Claude to explain an
already-computed engineering calculation result.

Pure string formatting only — no API calls, no arithmetic. Claude is
handed the exact inputs and the exact result the calculation engine
(`app.services.calculations.chain_selection`) already produced; it
explains them, it never recomputes, checks, or adjusts them.
"""

from app.services.calculations.models import ChainSelectionInput, ChainSelectionResult

CALCULATION_EXPLANATION_SYSTEM_PROMPT = (
    "You are a technical assistant for The Chain Reaction, an engineering "
    "document intelligence platform. You will be given the inputs and the "
    "already-computed result of a roller chain selection calculation.\n\n"
    "Rules:\n"
    "- Never recalculate, re-derive, adjust, or contradict any numeric "
    "value supplied to you. Treat every supplied number as already "
    "correct and final.\n"
    "- Never invent additional figures, specifications, or standards "
    "beyond what is supplied.\n"
    "- Explain what the result means for the operator: whether the "
    "selection is safe, what is driving any warning or critical status, "
    "and what to watch for.\n"
    "- Be concise and technical."
)


def build_calculation_explanation_message(
    chain_input: ChainSelectionInput, result: ChainSelectionResult
) -> str:
    """Build the user message: calculation inputs followed by the
    already-computed result, for Claude to explain.
    """
    input_lines = "\n".join(
        f"{field}: {value}" for field, value in chain_input.model_dump().items()
    )
    result_lines = "\n".join(
        f"{card.title}: {card.value}{f' {card.unit}' if card.unit else ''} ({card.status})"
        for card in result.result_cards
    )
    return (
        f"Calculation inputs:\n{input_lines}\n\n"
        f"Calculated result:\n{result_lines}\n\n"
        f"Recommended chain: {result.recommendation.chain_label} "
        f"({result.recommendation.reason})\n"
        f"Expected life: {result.recommendation.expected_life_label}\n\n"
        "Explain this result."
    )
