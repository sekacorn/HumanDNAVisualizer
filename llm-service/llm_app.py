"""
LLM Service for Natural Language Queries and Troubleshooting
Supports queries about genomic data, trait predictions, and debugging
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DNA LLM Query Service", version="1.0.0")


class UserPersonality(str, Enum):
    """User personality types for tailored responses"""
    STRATEGIC = "strategic"  # ENTJ, INTJ, ESTJ
    CREATIVE = "creative"    # INFP, ISFP, ENFP
    EMPATHETIC = "empathetic"  # INFJ, ENFJ, ESFJ
    ANALYTICAL = "analytical"  # INTP, ISTP
    ACTION_ORIENTED = "action_oriented"  # ESTP, ESFP, ENTP


class QueryType(str, Enum):
    HEALTH_RISK = "health_risk"
    TRAIT_ANALYSIS = "trait_analysis"
    ANCESTRY = "ancestry"
    TROUBLESHOOTING = "troubleshooting"
    GENERAL = "general"


class QueryRequest(BaseModel):
    user_id: str
    query: str
    query_type: QueryType
    personality_preference: Optional[UserPersonality] = UserPersonality.STRATEGIC
    context: Optional[Dict] = None


class QueryResponse(BaseModel):
    user_id: str
    response: str
    suggestions: List[str]
    related_topics: List[str]


def generate_response(request: QueryRequest) -> str:
    """
    Generate tailored response based on query type and user personality
    """
    query_lower = request.query.lower()

    # Health risk queries
    if request.query_type == QueryType.HEALTH_RISK or any(word in query_lower for word in ['risk', 'disease', 'health']):
        if request.personality_preference == UserPersonality.STRATEGIC:
            return f"""Based on your genomic analysis, here's your strategic health overview:

**Key Health Insights:**
- Your genetic profile shows specific predispositions that require attention
- Risk factors can be managed through targeted lifestyle interventions
- Proactive monitoring is recommended for optimal health outcomes

**Action Plan:**
1. Review your specific trait predictions in the Analyze section
2. Implement recommended lifestyle modifications
3. Schedule regular health screenings based on your genetic risk profile

**Next Steps:**
Navigate to your trait analysis dashboard to view detailed risk assessments and personalized recommendations."""

        elif request.personality_preference == UserPersonality.EMPATHETIC:
            return f"""I understand you're concerned about your health risks. Let's explore this together:

**Your Health Journey:**
Your genetic information provides valuable insights, but remember - genetics is just one part of your health story. Environmental factors and lifestyle choices play a significant role.

**What This Means for You:**
- Each person's genetic profile is unique and tells a personal story
- Understanding your predispositions empowers you to make informed choices
- You're taking a positive step by exploring your genomic data

**How We Can Help:**
I'm here to guide you through your results with compassion and clarity. Your health insights are designed to support, not worry you."""

        elif request.personality_preference == UserPersonality.ACTION_ORIENTED:
            return f"""**Quick Health Risk Summary:**

✓ Upload your VCF/FHIR data
✓ Run trait prediction analysis
✓ Get actionable recommendations NOW

**Top 3 Actions:**
1. Check your Analyze page for risk scores
2. Implement high-priority recommendations
3. Track progress with environmental data uploads

**Ready?** Click 'Analyze' to see your results instantly!"""

    # Trait analysis queries
    elif request.query_type == QueryType.TRAIT_ANALYSIS or any(word in query_lower for word in ['trait', 'cognitive', 'memory']):
        return f"""**Trait Analysis Insights:**

Your genetic profile includes markers related to:
- Cognitive function and memory
- Metabolic traits (caffeine, vitamin processing)
- Physical characteristics

**How Traits Are Predicted:**
We analyze genetic variants (SNPs) combined with your phenotypic and environmental data using AI models trained on genomic research.

**Understanding Your Results:**
- Confidence scores indicate prediction reliability
- Traits are influenced by multiple genetic and environmental factors
- Results provide guidance, not deterministic outcomes"""

    # Troubleshooting queries
    elif request.query_type == QueryType.TROUBLESHOOTING or any(word in query_lower for word in ['error', 'problem', 'fail', 'slow']):
        return f"""**Troubleshooting Guide:**

**Common Issues:**

1. **VCF Upload Failing:**
   - Ensure file is valid VCF format
   - Check file size (max 50MB)
   - Verify no special characters in filename

2. **Visualization Loading Slowly:**
   - Large datasets may take 30-60 seconds
   - Check your internet connection
   - Try refreshing the page

3. **FHIR Data Not Parsing:**
   - Confirm FHIR R4 format compliance
   - Validate JSON structure
   - Check for required fields

**Need More Help?**
Check the detailed logs in your browser console (F12) and contact support with any error messages."""

    # General queries
    else:
        return f"""**Welcome to HumanDNAVisualizer!**

I can help you with:
- Understanding your genetic health risks
- Analyzing trait predictions
- Exploring ancestry insights
- Troubleshooting data uploads
- Navigating the platform

**Popular Questions:**
- "What health risks are in my DNA?"
- "How do my genes affect my traits?"
- "Why is my VCF import failing?"

What would you like to explore?"""


def generate_suggestions(request: QueryRequest) -> List[str]:
    """Generate contextual suggestions"""
    if request.query_type == QueryType.HEALTH_RISK:
        return [
            "View detailed trait predictions",
            "Upload environmental data for better accuracy",
            "Explore personalized recommendations"
        ]
    elif request.query_type == QueryType.TROUBLESHOOTING:
        return [
            "Check file format compatibility",
            "Review system requirements",
            "View example data files"
        ]
    else:
        return [
            "Upload your genomic data (VCF)",
            "Explore 3D DNA visualizations",
            "Run AI trait predictions"
        ]


@app.get("/")
def root():
    return {"message": "DNA LLM Query Service", "status": "running"}


@app.post("/query", response_model=QueryResponse)
def process_query(request: QueryRequest):
    """
    Process natural language queries with personality-tailored responses
    """
    try:
        logger.info(f"Processing query for user: {request.user_id}, type: {request.query_type}")

        response_text = generate_response(request)
        suggestions = generate_suggestions(request)

        related_topics = [
            "Genomic Data Upload",
            "Trait Predictions",
            "3D Visualizations",
            "Health Recommendations"
        ]

        return QueryResponse(
            user_id=request.user_id,
            response=response_text,
            suggestions=suggestions,
            related_topics=related_topics
        )

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
