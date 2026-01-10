"""
Golden Tests for Deterministic Explainer

Tests explanation generation with known anatomy graph inputs.
Educational/research purposes only.
"""

import unittest
import json
from deterministic_explainer import (
    generate_explanation,
    ExplanationStyle,
    count_by_evidence,
    count_by_node_type,
    get_affected_structures
)


# Golden anatomy graph for testing
GOLDEN_ANATOMY_GRAPH = {
    "sampleId": 1,
    "rulesVersion": "1.0.0",
    "nodes": [
        {"id": "cardiovascular_system", "type": "SYSTEM", "label": "Cardiovascular System"},
        {"id": "nervous_system", "type": "SYSTEM", "label": "Nervous System"},
        {"id": "heart", "type": "ORGAN", "label": "Heart"},
        {"id": "brain", "type": "ORGAN", "label": "Brain"},
        {"id": "left_ventricle", "type": "SUBSTRUCTURE", "label": "Left Ventricle"},
        {"id": "hippocampus", "type": "SUBSTRUCTURE", "label": "Hippocampus"}
    ],
    "edges": [
        {"from": "cardiovascular_system", "to": "heart", "relation": "contains"},
        {"from": "heart", "to": "left_ventricle", "relation": "contains"},
        {"from": "nervous_system", "to": "brain", "relation": "contains"},
        {"from": "brain", "to": "hippocampus", "relation": "contains"}
    ],
    "overlays": [
        {
            "targetNodeId": "cardiovascular_system",
            "intensity": 0.6,
            "label": "Variant in genomic region associated with cardiovascular structure",
            "evidence": "LOW",
            "sources": ["Demo rule 001"]
        },
        {
            "targetNodeId": "heart",
            "intensity": 0.8,
            "label": "Variant associated with cardiac structure",
            "evidence": "MEDIUM",
            "sources": ["Demo rule 002"]
        },
        {
            "targetNodeId": "brain",
            "intensity": 0.9,
            "label": "Well-established association with neural structure",
            "evidence": "HIGH",
            "sources": ["Demo rule 003", "Replicated study"]
        }
    ],
    "disclaimer": "Educational/research visualization only."
}


class TestDeterministicExplainer(unittest.TestCase):
    """Test suite for deterministic explainer"""

    def test_count_by_evidence(self):
        """Test evidence counting"""
        counts = count_by_evidence(GOLDEN_ANATOMY_GRAPH["overlays"])

        self.assertEqual(counts["HIGH"], 1)
        self.assertEqual(counts["MEDIUM"], 1)
        self.assertEqual(counts["LOW"], 1)

    def test_count_by_node_type(self):
        """Test node type counting"""
        counts = count_by_node_type(GOLDEN_ANATOMY_GRAPH["nodes"])

        self.assertEqual(counts["SYSTEM"], 2)
        self.assertEqual(counts["ORGAN"], 2)
        self.assertEqual(counts["SUBSTRUCTURE"], 2)

    def test_get_affected_structures(self):
        """Test affected structure extraction"""
        affected = get_affected_structures(
            GOLDEN_ANATOMY_GRAPH["overlays"],
            GOLDEN_ANATOMY_GRAPH["nodes"]
        )

        self.assertEqual(len(affected), 3)
        self.assertIn("Cardiovascular System", affected)
        self.assertIn("Heart", affected)
        self.assertIn("Brain", affected)

    def test_concise_explanation(self):
        """Test concise explanation generation"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.CONCISE)

        explanation = result["explanation_text"]

        # Check structure
        self.assertIsInstance(explanation, str)
        self.assertGreater(len(explanation), 50)
        self.assertLess(len(explanation), 500)

        # Check content
        self.assertIn("3", explanation)  # 3 associations
        self.assertIn("high", explanation.lower())
        self.assertIn("medium", explanation.lower())
        self.assertIn("low", explanation.lower())

        # Check safety labels
        self.assertIn("Educational/research purposes only", result["safety_labels"])
        self.assertEqual(result["method"], "deterministic")

    def test_detailed_explanation(self):
        """Test detailed explanation generation"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)

        explanation = result["explanation_text"]

        # Check structure
        self.assertGreater(len(explanation), 200)

        # Check required content
        self.assertIn("sample", explanation.lower())
        self.assertIn("association", explanation.lower())
        self.assertIn("evidence", explanation.lower())
        self.assertIn("educational", explanation.lower())

        # Check mentions key structures
        self.assertIn("Cardiovascular", explanation)
        self.assertIn("Heart", explanation)
        self.assertIn("Brain", explanation)

        # Check evidence descriptions
        self.assertIn("high", explanation.lower())
        self.assertIn("medium", explanation.lower())
        self.assertIn("low", explanation.lower())

    def test_technical_explanation(self):
        """Test technical explanation generation"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.TECHNICAL)

        explanation = result["explanation_text"]

        # Check structure
        self.assertGreater(len(explanation), 400)

        # Check technical content
        self.assertIn("Sample ID", explanation)
        self.assertIn("Graph Nodes", explanation)
        self.assertIn("Graph Edges", explanation)
        self.assertIn("version", explanation.lower())

        # Check statistics
        self.assertIn("Distribution", explanation)
        self.assertIn("%", explanation)  # Should have percentages
        self.assertIn("Intensity", explanation)

        # Check technical terms
        self.assertIn("hierarchical", explanation.lower())
        self.assertIn("pipeline", explanation.lower() or "processing" in explanation.lower())

    def test_empty_overlays(self):
        """Test explanation with no overlays"""
        empty_graph = {
            "sampleId": 2,
            "rulesVersion": "1.0.0",
            "nodes": GOLDEN_ANATOMY_GRAPH["nodes"],
            "edges": GOLDEN_ANATOMY_GRAPH["edges"],
            "overlays": []
        }

        result = generate_explanation(empty_graph, ExplanationStyle.DETAILED)
        explanation = result["explanation_text"]

        # Should explain the absence of overlays
        self.assertIn("no", explanation.lower())
        self.assertIn("base", explanation.lower())
        self.assertIn("structure", explanation.lower())

    def test_deterministic_output(self):
        """Test that same input produces same output"""
        result1 = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)
        result2 = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)

        self.assertEqual(result1["explanation_text"], result2["explanation_text"])
        self.assertEqual(result1["style"], result2["style"])
        self.assertEqual(result1["method"], result2["method"])

    def test_safety_compliance(self):
        """Test that generated explanations are safe"""
        styles = [ExplanationStyle.CONCISE, ExplanationStyle.DETAILED, ExplanationStyle.TECHNICAL]

        forbidden_terms = [
            "diagnose", "diagnosis", "treat", "treatment", "cure",
            "recommend", "should you", "medical advice", "prescribe"
        ]

        for style in styles:
            result = generate_explanation(GOLDEN_ANATOMY_GRAPH, style)
            explanation_lower = result["explanation_text"].lower()

            for term in forbidden_terms:
                self.assertNotIn(
                    term,
                    explanation_lower,
                    f"Forbidden term '{term}' found in {style.value} explanation"
                )

    def test_evidence_labeling(self):
        """Test that evidence levels are mentioned"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)
        explanation = result["explanation_text"]

        # Should mention all three evidence levels
        self.assertIn("high", explanation.lower())
        self.assertIn("medium", explanation.lower())
        self.assertIn("low", explanation.lower())

        # Should explain what evidence means
        self.assertIn("evidence", explanation.lower())

    def test_educational_disclaimer(self):
        """Test that educational disclaimers are included"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)

        # Check safety labels
        safety_labels = result["safety_labels"]
        self.assertTrue(any("educational" in label.lower() for label in safety_labels))
        self.assertTrue(any("research" in label.lower() for label in safety_labels))

        # Check explanation text
        explanation = result["explanation_text"]
        self.assertIn("educational", explanation.lower())

    def test_citations(self):
        """Test that citations are included"""
        result = generate_explanation(GOLDEN_ANATOMY_GRAPH, ExplanationStyle.DETAILED)

        citations = result["citations_used"]
        self.assertIsInstance(citations, list)
        self.assertGreater(len(citations), 0)
        self.assertTrue(any("version" in citation.lower() for citation in citations))


class TestGoldenFiles(unittest.TestCase):
    """Test golden file generation and validation"""

    def test_generate_golden_output(self):
        """Generate golden output files for reference"""
        # This test generates reference outputs for manual review

        outputs = {}

        for style in [ExplanationStyle.CONCISE, ExplanationStyle.DETAILED, ExplanationStyle.TECHNICAL]:
            result = generate_explanation(GOLDEN_ANATOMY_GRAPH, style)
            outputs[style.value] = {
                "explanation": result["explanation_text"],
                "safety_labels": result["safety_labels"],
                "citations": result["citations_used"],
                "method": result["method"]
            }

        # Save to file (optional - for manual inspection)
        try:
            with open("golden_explanations.json", "w") as f:
                json.dump(outputs, f, indent=2)
            print("\nGolden outputs saved to golden_explanations.json")
        except Exception as e:
            print(f"\nNote: Could not save golden file: {e}")

        # Verify structure
        for style, output in outputs.items():
            self.assertIn("explanation", output)
            self.assertIn("safety_labels", output)
            self.assertIn("citations", output)
            self.assertEqual(output["method"], "deterministic")


if __name__ == "__main__":
    # Run tests
    unittest.main(verbosity=2)
