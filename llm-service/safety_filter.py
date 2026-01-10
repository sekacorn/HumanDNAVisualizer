"""
Safety Filter Module

Detects and blocks forbidden medical intents in user queries.
Enforces educational/research constraints for explanation requests.

Educational/research purposes only - not for medical diagnosis or treatment.
"""

import re
from typing import Dict, List, Tuple
from enum import Enum


class SafetyViolation(Enum):
    """Types of safety violations"""
    DIAGNOSIS_REQUEST = "diagnosis_request"
    TREATMENT_REQUEST = "treatment_request"
    RECOMMENDATION_REQUEST = "recommendation_request"
    MEDICAL_ADVICE = "medical_advice"
    LIFESTYLE_ADVICE = "lifestyle_advice"
    SAFE = "safe"


# Forbidden intent patterns
FORBIDDEN_PATTERNS = {
    SafetyViolation.DIAGNOSIS_REQUEST: [
        r'\bdiagnos[ei]\b',
        r'\b(detect|identify|find)\s+(disease|condition|disorder|illness)',
        r'\bdo\s+i\s+have\b',
        r'\bam\s+i\s+(sick|ill|diseased)',
        r'\bwhat\s+(disease|condition|disorder)\s+do\s+i\s+have',
        r'\btest\s+for\s+(disease|condition|disorder)',
    ],
    SafetyViolation.TREATMENT_REQUEST: [
        r'\btreat(ment|ing)?\b',
        r'\b(cure|heal)\s+(my|this|the)\b',
        r'\b(medication|medicine|drug|therapy)\s+(for|to)',
        r'\bhow\s+(to\s+)?treat\b',
        r'\bwhat\s+(medication|drug)\b',
        r'\b(dosage|dose)\b',
    ],
    SafetyViolation.RECOMMENDATION_REQUEST: [
        r'\brecommend(ed|ing|ation)?\b',
        r'\bshould\s+i\s+(take|eat|avoid|do|change)',
        r'\bwhat\s+should\s+i\b',
        r'\bbest\s+(diet|exercise|lifestyle|supplement)',
        r'\b(prescription|prescribe)\b',
    ],
    SafetyViolation.MEDICAL_ADVICE: [
        r'\bmedical\s+advice\b',
        r'\bconsult\s+(me|about|on)\b',
        r'\bhealth\s+decision',
        r'\bprognosis\b',
        r'\blife\s+expectancy\b',
    ],
    SafetyViolation.LIFESTYLE_ADVICE: [
        r'\blifestyle\s+(change|modification|recommendation)',
        r'\bdiet\s+plan\b',
        r'\bexercise\s+(plan|routine|regimen)',
        r'\bsupplement\s+(recommend|advice)',
    ]
}


# Safe replacement prompts
SAFE_REPLACEMENTS = {
    SafetyViolation.DIAGNOSIS_REQUEST:
        "explain the associations shown in this anatomy visualization",

    SafetyViolation.TREATMENT_REQUEST:
        "describe the genomic-anatomic associations in educational terms",

    SafetyViolation.RECOMMENDATION_REQUEST:
        "explain what this data represents in research context",

    SafetyViolation.MEDICAL_ADVICE:
        "provide an educational explanation of the visualization",

    SafetyViolation.LIFESTYLE_ADVICE:
        "describe the anatomical structures and their associations"
}


def detect_forbidden_intent(query: str) -> Tuple[SafetyViolation, float]:
    """
    Detect if query contains forbidden medical intent.

    Args:
        query: User query string

    Returns:
        Tuple of (violation_type, confidence_score)
        Returns (SafetyViolation.SAFE, 0.0) if no violation detected
    """
    if not query:
        return (SafetyViolation.SAFE, 0.0)

    query_lower = query.lower().strip()

    # Check each forbidden pattern category
    for violation_type, patterns in FORBIDDEN_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, query_lower)
            if match:
                # Calculate confidence based on match specificity
                confidence = 0.9 if len(match.group()) > 10 else 0.7
                return (violation_type, confidence)

    return (SafetyViolation.SAFE, 0.0)


def get_safe_replacement(violation_type: SafetyViolation) -> str:
    """
    Get safe replacement prompt for a detected violation.

    Args:
        violation_type: Type of safety violation

    Returns:
        Safe replacement prompt string
    """
    return SAFE_REPLACEMENTS.get(
        violation_type,
        "explain the educational content shown in this visualization"
    )


def enforce_safety(query: str, allow_rewrite: bool = True) -> Dict[str, any]:
    """
    Enforce safety on user query.

    Args:
        query: User query string
        allow_rewrite: If True, rewrite unsafe queries; if False, reject them

    Returns:
        Dictionary with:
        - safe: bool
        - original_query: str
        - safe_query: str (rewritten or original)
        - violation: SafetyViolation or None
        - confidence: float
        - message: str (explanation)
    """
    violation, confidence = detect_forbidden_intent(query)

    if violation == SafetyViolation.SAFE:
        return {
            "safe": True,
            "original_query": query,
            "safe_query": query,
            "violation": None,
            "confidence": 0.0,
            "message": "Query is safe for educational explanation"
        }

    # Unsafe query detected
    if allow_rewrite:
        safe_query = get_safe_replacement(violation)
        return {
            "safe": False,
            "original_query": query,
            "safe_query": safe_query,
            "violation": violation.value,
            "confidence": confidence,
            "message": (
                f"Query rewritten for safety. Original intent detected: {violation.value}. "
                "This platform provides educational visualizations only, not medical advice."
            )
        }
    else:
        return {
            "safe": False,
            "original_query": query,
            "safe_query": None,
            "violation": violation.value,
            "confidence": confidence,
            "message": (
                f"Query blocked: {violation.value} detected. "
                "This platform is for educational/research visualization only. "
                "We cannot provide medical diagnosis, treatment advice, or recommendations. "
                "Please consult a qualified healthcare professional for medical decisions."
            )
        }


def validate_output_safety(text: str) -> Dict[str, any]:
    """
    Validate that generated output doesn't contain forbidden medical language.

    Args:
        text: Generated explanation text

    Returns:
        Dictionary with:
        - safe: bool
        - violations: List[str]
        - message: str
    """
    violations = []
    text_lower = text.lower()

    # Forbidden output terms
    forbidden_terms = {
        "diagnosis": r'\bdiagnos(is|e|ed|ing)\b',
        "treatment": r'\btreat(ment|ing|ed)\b(?!\s+as)',  # Allow "treated as example"
        "cure": r'\bcur(e|ed|ing)\b',
        "recommend": r'\brecommend(ed|ing|ation|s)\b',
        "should you": r'\b(you\s+should|should\s+you)\b',
        "medical advice": r'\bmedical\s+advice\b',
        "risk of disease": r'\brisk\s+of\s+(disease|condition)',
        "prescribe": r'\bprescrib(e|ed|ing|tion)\b',
    }

    for term_name, pattern in forbidden_terms.items():
        if re.search(pattern, text_lower):
            violations.append(term_name)

    is_safe = len(violations) == 0

    return {
        "safe": is_safe,
        "violations": violations,
        "message": "Output is safe" if is_safe else f"Output contains forbidden terms: {', '.join(violations)}"
    }


# Test cases for validation
def run_safety_tests():
    """Run basic safety filter tests"""
    test_cases = [
        # Safe queries
        ("explain what I'm seeing", SafetyViolation.SAFE),
        ("what does this overlay mean", SafetyViolation.SAFE),
        ("tell me about the anatomical structures", SafetyViolation.SAFE),
        ("what associations are shown", SafetyViolation.SAFE),

        # Forbidden queries
        ("do I have a disease", SafetyViolation.DIAGNOSIS_REQUEST),
        ("how to treat this condition", SafetyViolation.TREATMENT_REQUEST),
        ("what medication should I take", SafetyViolation.RECOMMENDATION_REQUEST),
        ("should I change my diet", SafetyViolation.RECOMMENDATION_REQUEST),
        ("diagnose my health problem", SafetyViolation.DIAGNOSIS_REQUEST),
    ]

    print("Running safety filter tests...")
    passed = 0
    failed = 0

    for query, expected_violation in test_cases:
        detected_violation, confidence = detect_forbidden_intent(query)

        if detected_violation == expected_violation:
            print(f"✓ PASS: '{query}' → {detected_violation.value}")
            passed += 1
        else:
            print(f"✗ FAIL: '{query}' → Expected {expected_violation.value}, got {detected_violation.value}")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    # Run tests when module is executed directly
    success = run_safety_tests()
    exit(0 if success else 1)
