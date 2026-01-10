"""
Explainer Service

Safe AI-assisted explanation layer for anatomy graph visualizations.
Implements deterministic fallback with optional LLM enhancement.

Educational/research purposes only - not for medical diagnosis or treatment.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import logging
import os

from safety_filter import enforce_safety, validate_output_safety
from deterministic_explainer import generate_explanation, ExplanationStyle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Anatomy Graph Explainer Service",
    version="1.0.0",
    description="Safe explanation service for genomic-anatomic visualizations"
)

# Environment configuration
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")


class ExplainRequest(BaseModel):
    """Request model for explain endpoint"""
    anatomyGraph: Dict = Field(..., description="AnatomyGraph from backend")
    userQuestion: Optional[str] = Field(
        None,
        description="Optional user question about the visualization"
    )
    style: Optional[str] = Field(
        "detailed",
        description="Explanation style: concise, detailed, or technical"
    )


class ExplainResponse(BaseModel):
    """Response model for explain endpoint"""
    explanationText: str = Field(..., description="Generated explanation")
    safetyLabels: List[str] = Field(..., description="Safety and compliance labels")
    citationsUsed: List[str] = Field(..., description="Sources and references")
    method: str = Field(..., description="Generation method: deterministic or llm")
    queryWasRewritten: bool = Field(False, description="Whether unsafe query was rewritten")
    originalQuery: Optional[str] = Field(None, description="Original query if rewritten")
    safetyMessage: Optional[str] = Field(None, description="Safety filter message")


def generate_llm_explanation(
    anatomy_graph: Dict,
    safe_query: str,
    style: str
) -> Dict[str, any]:
    """
    Generate explanation using LLM (if configured).

    Args:
        anatomy_graph: AnatomyGraph dictionary
        safe_query: Safety-filtered query
        style: Explanation style

    Returns:
        Dictionary with explanation and metadata

    Note:
        Currently returns fallback. Implement LLM integration here if needed.
    """
    # TODO: Implement actual LLM call if USE_LLM is True and API key configured
    # For now, always use deterministic fallback for safety
    logger.info("LLM mode requested but not yet implemented, using deterministic fallback")

    try:
        style_enum = ExplanationStyle(style)
    except ValueError:
        style_enum = ExplanationStyle.DETAILED

    return generate_explanation(anatomy_graph, style_enum, safe_query)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "Anatomy Graph Explainer",
        "status": "running",
        "mode": "llm" if USE_LLM and LLM_API_KEY else "deterministic",
        "safety_filter": "enabled"
    }


@app.post("/explain", response_model=ExplainResponse)
def explain_visualization(request: ExplainRequest):
    """
    Generate safe explanation of anatomy graph visualization.

    This endpoint:
    1. Applies safety filter to user query
    2. Generates explanation using deterministic or LLM method
    3. Validates output safety
    4. Returns educational explanation with safety labels

    Educational/research purposes only - not for medical diagnosis or treatment.
    """
    try:
        logger.info(f"Explanation request received for sample {request.anatomyGraph.get('sampleId')}")

        # Default query if none provided
        user_query = request.userQuestion or "explain what I'm seeing in this visualization"

        # Apply safety filter to user query
        safety_result = enforce_safety(user_query, allow_rewrite=True)

        query_was_rewritten = not safety_result["safe"]
        safe_query = safety_result["safe_query"]
        original_query = user_query if query_was_rewritten else None
        safety_message = safety_result["message"] if query_was_rewritten else None

        if query_was_rewritten:
            logger.warning(
                f"Unsafe query rewritten: {safety_result['violation']} "
                f"(confidence: {safety_result['confidence']:.2f})"
            )

        # Generate explanation
        if USE_LLM and LLM_API_KEY:
            explanation_result = generate_llm_explanation(
                request.anatomyGraph,
                safe_query,
                request.style or "detailed"
            )
        else:
            # Use deterministic fallback (default)
            try:
                style_enum = ExplanationStyle(request.style or "detailed")
            except ValueError:
                style_enum = ExplanationStyle.DETAILED

            explanation_result = generate_explanation(
                request.anatomyGraph,
                style_enum,
                safe_query
            )

        # Validate output safety
        output_safety = validate_output_safety(explanation_result["explanation_text"])

        if not output_safety["safe"]:
            logger.error(f"Generated output failed safety check: {output_safety['violations']}")
            raise HTTPException(
                status_code=500,
                detail=f"Generated explanation failed safety validation: {output_safety['message']}"
            )

        # Build response
        response = ExplainResponse(
            explanationText=explanation_result["explanation_text"],
            safetyLabels=explanation_result.get("safety_labels", [
                "Educational/research purposes only",
                "Not for medical diagnosis or treatment"
            ]),
            citationsUsed=explanation_result.get("citations_used", []),
            method=explanation_result.get("method", "deterministic"),
            queryWasRewritten=query_was_rewritten,
            originalQuery=original_query,
            safetyMessage=safety_message
        )

        logger.info(f"Explanation generated successfully (method: {response.method})")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating explanation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mode": "llm" if USE_LLM and LLM_API_KEY else "deterministic",
        "safety_filter": "enabled"
    }


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting Explainer Service in {'LLM' if USE_LLM and LLM_API_KEY else 'DETERMINISTIC'} mode")
    logger.info(f"Safety filter: ENABLED")

    uvicorn.run(app, host="0.0.0.0", port=8003)
