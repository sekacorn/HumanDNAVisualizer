"""
Unit Tests for Safety Filter

Tests forbidden intent detection and safe query rewriting.
Educational/research purposes only.
"""

import unittest
from safety_filter import (
    detect_forbidden_intent,
    enforce_safety,
    get_safe_replacement,
    validate_output_safety,
    SafetyViolation
)


class TestSafetyFilter(unittest.TestCase):
    """Test suite for safety filter module"""

    def test_safe_queries(self):
        """Test that safe queries are not flagged"""
        safe_queries = [
            "explain what I'm seeing",
            "what does this overlay mean",
            "tell me about the anatomical structures",
            "what associations are shown",
            "describe this visualization",
            "what do the colors represent",
            "explain the evidence levels",
        ]

        for query in safe_queries:
            violation, confidence = detect_forbidden_intent(query)
            self.assertEqual(
                violation,
                SafetyViolation.SAFE,
                f"Safe query incorrectly flagged: '{query}'"
            )

    def test_diagnosis_detection(self):
        """Test detection of diagnosis requests"""
        diagnosis_queries = [
            "do I have a disease",
            "diagnose my condition",
            "what disease do I have",
            "am I sick",
            "detect disease in my DNA",
        ]

        for query in diagnosis_queries:
            violation, confidence = detect_forbidden_intent(query)
            self.assertEqual(
                violation,
                SafetyViolation.DIAGNOSIS_REQUEST,
                f"Diagnosis query not detected: '{query}'"
            )
            self.assertGreater(confidence, 0.5, "Confidence too low")

    def test_treatment_detection(self):
        """Test detection of treatment requests"""
        treatment_queries = [
            "how to treat this condition",
            "what medication should I take",
            "cure my disease",
            "treatment for this disorder",
            "what drug is best",
        ]

        for query in treatment_queries:
            violation, confidence = detect_forbidden_intent(query)
            self.assertEqual(
                violation,
                SafetyViolation.TREATMENT_REQUEST,
                f"Treatment query not detected: '{query}'"
            )

    def test_recommendation_detection(self):
        """Test detection of recommendation requests"""
        recommendation_queries = [
            "should I change my diet",
            "what lifestyle changes should I make",
            "recommend supplements for me",
            "best exercise for my genes",
            "what should I avoid eating",
        ]

        for query in recommendation_queries:
            violation, confidence = detect_forbidden_intent(query)
            self.assertIn(
                violation,
                [SafetyViolation.RECOMMENDATION_REQUEST, SafetyViolation.LIFESTYLE_ADVICE],
                f"Recommendation query not detected: '{query}'"
            )

    def test_medical_advice_detection(self):
        """Test detection of medical advice requests"""
        medical_queries = [
            "give me medical advice",
            "what's my prognosis",
            "consult me about my health",
            "health decision guidance",
        ]

        for query in medical_queries:
            violation, confidence = detect_forbidden_intent(query)
            self.assertNotEqual(
                violation,
                SafetyViolation.SAFE,
                f"Medical advice query not detected: '{query}'"
            )

    def test_safe_replacement(self):
        """Test safe query replacement"""
        unsafe_query = "do I have a disease"
        replacement = get_safe_replacement(SafetyViolation.DIAGNOSIS_REQUEST)

        self.assertIsInstance(replacement, str)
        self.assertGreater(len(replacement), 10)
        self.assertIn("association", replacement.lower())

    def test_enforce_safety_with_rewrite(self):
        """Test safety enforcement with rewriting enabled"""
        unsafe_query = "diagnose my health problem"
        result = enforce_safety(unsafe_query, allow_rewrite=True)

        self.assertFalse(result["safe"])
        self.assertEqual(result["original_query"], unsafe_query)
        self.assertIsNotNone(result["safe_query"])
        self.assertNotEqual(result["safe_query"], unsafe_query)
        self.assertIsNotNone(result["violation"])
        self.assertGreater(result["confidence"], 0.0)

    def test_enforce_safety_without_rewrite(self):
        """Test safety enforcement with rewriting disabled"""
        unsafe_query = "what treatment should I get"
        result = enforce_safety(unsafe_query, allow_rewrite=False)

        self.assertFalse(result["safe"])
        self.assertEqual(result["original_query"], unsafe_query)
        self.assertIsNone(result["safe_query"])
        self.assertIn("blocked", result["message"].lower())

    def test_enforce_safety_safe_query(self):
        """Test safety enforcement with safe query"""
        safe_query = "explain the visualization"
        result = enforce_safety(safe_query, allow_rewrite=True)

        self.assertTrue(result["safe"])
        self.assertEqual(result["safe_query"], safe_query)
        self.assertIsNone(result["violation"])
        self.assertEqual(result["confidence"], 0.0)

    def test_output_safety_validation_safe(self):
        """Test output validation with safe text"""
        safe_outputs = [
            "This visualization shows genomic-anatomic associations.",
            "The overlay indicates an association with the cardiovascular system.",
            "Evidence quality is labeled as MEDIUM for this structure.",
            "This data represents associations from current models.",
        ]

        for text in safe_outputs:
            result = validate_output_safety(text)
            self.assertTrue(
                result["safe"],
                f"Safe output flagged as unsafe: '{text}'"
            )
            self.assertEqual(len(result["violations"]), 0)

    def test_output_safety_validation_unsafe(self):
        """Test output validation with unsafe text"""
        unsafe_outputs = [
            "You should take this medication.",
            "This diagnosis indicates a serious condition.",
            "We recommend changing your diet immediately.",
            "The treatment plan should include therapy.",
            "You are at risk of developing disease.",
        ]

        for text in unsafe_outputs:
            result = validate_output_safety(text)
            self.assertFalse(
                result["safe"],
                f"Unsafe output not detected: '{text}'"
            )
            self.assertGreater(len(result["violations"]), 0)

    def test_empty_query(self):
        """Test handling of empty query"""
        violation, confidence = detect_forbidden_intent("")
        self.assertEqual(violation, SafetyViolation.SAFE)
        self.assertEqual(confidence, 0.0)

    def test_none_query(self):
        """Test handling of None query"""
        violation, confidence = detect_forbidden_intent(None)
        self.assertEqual(violation, SafetyViolation.SAFE)
        self.assertEqual(confidence, 0.0)


if __name__ == "__main__":
    # Run tests
    unittest.main(verbosity=2)
