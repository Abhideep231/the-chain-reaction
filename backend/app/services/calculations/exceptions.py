"""Exceptions raised by the engineering calculation service.

`calculation_type` is a closed `Literal` on the request schema, so an
unrecognized calculation type is already rejected by Pydantic before
this service ever runs — there is no "unknown calculation type" failure
mode to model here.
"""


class CalculationError(Exception):
    """Base class for all calculation failures."""


class InvalidCalculationInputError(CalculationError):
    """A calculation input is missing, out of range, or otherwise invalid."""
