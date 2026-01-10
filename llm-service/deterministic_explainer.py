"""
Deterministic Fallback Explainer

Template-based explanation generator that works without LLM.
Provides consistent, safe educational explanations of anatomy graphs.

Educational/research purposes only - not for medical diagnosis or treatment.
"""

from typing import Dict, List, Optional
from enum import Enum


class ExplanationStyle(str, Enum):
    """Explanation verbosity styles"""
    CONCISE = "concise"
    DETAILED = "detailed"
    TECHNICAL = "technical"


def count_by_evidence(overlays: List[Dict]) -> Dict[str, int]:
    """Count overlays by evidence level"""
    counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for overlay in overlays:
        evidence = overlay.get("evidence", "LOW")
        if evidence in counts:
            counts[evidence] += 1
    return counts


def count_by_node_type(nodes: List[Dict]) -> Dict[str, int]:
    """Count nodes by type"""
    counts = {"SYSTEM": 0, "ORGAN": 0, "SUBSTRUCTURE": 0}
    for node in nodes:
        node_type = node.get("type", "")
        if node_type in counts:
            counts[node_type] += 1
    return counts


def get_affected_structures(overlays: List[Dict], nodes: List[Dict]) -> List[str]:
    """Get list of anatomical structures with associations"""
    affected_node_ids = {o.get("targetNodeId") for o in overlays}
    affected_labels = []

    for node in nodes:
        if node.get("id") in affected_node_ids:
            affected_labels.append(node.get("label", node.get("id")))

    return sorted(affected_labels)


def calculate_intensity_stats(overlays: List[Dict]) -> Dict[str, float]:
    """Calculate intensity statistics"""
    if not overlays:
        return {"min": 0.0, "max": 0.0, "avg": 0.0}

    intensities = [o.get("intensity", 0.0) for o in overlays]
    return {
        "min": min(intensities),
        "max": max(intensities),
        "avg": sum(intensities) / len(intensities)
    }


def explain_concise(anatomy_graph: Dict) -> str:
    """
    Generate concise explanation (1-2 sentences)

    Args:
        anatomy_graph: AnatomyGraph dictionary

    Returns:
        Concise explanation string
    """
    overlays = anatomy_graph.get("overlays", [])
    nodes = anatomy_graph.get("nodes", [])

    overlay_count = len(overlays)
    evidence_counts = count_by_evidence(overlays)
    affected = get_affected_structures(overlays, nodes)

    if overlay_count == 0:
        return (
            "This visualization shows the base anatomical structure "
            "with no genomic variant associations currently displayed."
        )

    affected_text = f"{len(affected)} anatomical structure(s)" if len(affected) > 3 else ", ".join(affected)

    return (
        f"This visualization shows {overlay_count} genomic-anatomic association(s) "
        f"affecting {affected_text}. "
        f"Evidence quality: {evidence_counts['HIGH']} high, {evidence_counts['MEDIUM']} medium, "
        f"{evidence_counts['LOW']} low."
    )


def explain_detailed(anatomy_graph: Dict) -> str:
    """
    Generate detailed explanation (paragraph format)

    Args:
        anatomy_graph: AnatomyGraph dictionary

    Returns:
        Detailed explanation string
    """
    overlays = anatomy_graph.get("overlays", [])
    nodes = anatomy_graph.get("nodes", [])
    sample_id = anatomy_graph.get("sampleId", "unknown")
    rules_version = anatomy_graph.get("rulesVersion", "unknown")

    overlay_count = len(overlays)
    evidence_counts = count_by_evidence(overlays)
    node_counts = count_by_node_type(nodes)
    affected = get_affected_structures(overlays, nodes)
    intensity_stats = calculate_intensity_stats(overlays)

    if overlay_count == 0:
        return f"""
**Anatomical Visualization Overview**

This 3D visualization displays the base anatomical structure model (version {rules_version})
for sample {sample_id}. The model includes {node_counts['SYSTEM']} body systems,
{node_counts['ORGAN']} organs, and {node_counts['SUBSTRUCTURE']} substructures.

Currently, no genomic variant associations are highlighted. This may indicate:
- No variants in the sample matched the current association rules
- Overlays are toggled off in the visualization
- The sample has not yet been processed through the association model

This is an educational visualization for research purposes only.
""".strip()

    # Build affected structures text
    if len(affected) <= 5:
        affected_text = ", ".join(affected)
    else:
        affected_text = ", ".join(affected[:5]) + f", and {len(affected) - 5} others"

    return f"""
**Anatomical Visualization Overview**

This 3D visualization shows genomic data from sample {sample_id} mapped onto anatomical
structures using association model version {rules_version}.

**Association Summary:**
- Total associations: {overlay_count}
- Affected structures: {affected_text}
- Evidence distribution: {evidence_counts['HIGH']} high-quality, {evidence_counts['MEDIUM']} medium-quality,
  {evidence_counts['LOW']} low-quality
- Association strength range: {intensity_stats['min']:.1%} to {intensity_stats['max']:.1%}
  (average: {intensity_stats['avg']:.1%})

**Anatomical Structure:**
The base model contains {node_counts['SYSTEM']} body systems, {node_counts['ORGAN']} organs,
and {node_counts['SUBSTRUCTURE']} detailed substructures, organized hierarchically.

**Evidence Quality:**
- **High**: Well-established associations with replicated findings
- **Medium**: Some supporting evidence, requires further validation
- **Low**: Preliminary or indirect associations

**Important Note:**
This visualization represents genomic-anatomic associations from current data models.
It is for educational and research purposes only, not for medical diagnosis, treatment
decisions, or lifestyle recommendations. All associations are labeled with evidence quality
to indicate certainty levels.
""".strip()


def explain_technical(anatomy_graph: Dict) -> str:
    """
    Generate technical explanation (detailed with structure info)

    Args:
        anatomy_graph: AnatomyGraph dictionary

    Returns:
        Technical explanation string
    """
    overlays = anatomy_graph.get("overlays", [])
    nodes = anatomy_graph.get("nodes", [])
    edges = anatomy_graph.get("edges", [])
    sample_id = anatomy_graph.get("sampleId", "unknown")
    rules_version = anatomy_graph.get("rulesVersion", "unknown")

    overlay_count = len(overlays)
    node_count = len(nodes)
    edge_count = len(edges)

    evidence_counts = count_by_evidence(overlays)
    node_counts = count_by_node_type(nodes)
    intensity_stats = calculate_intensity_stats(overlays)

    # Group overlays by target
    overlay_by_target = {}
    for overlay in overlays:
        target = overlay.get("targetNodeId", "unknown")
        if target not in overlay_by_target:
            overlay_by_target[target] = []
        overlay_by_target[target].append(overlay)

    # Find most affected node
    most_affected = max(overlay_by_target.items(), key=lambda x: len(x[1])) if overlay_by_target else ("none", [])

    return f"""
**Technical Analysis: Anatomy Graph Visualization**

**Graph Metadata:**
- Sample ID: {sample_id}
- Association Rules Version: {rules_version}
- Graph Nodes: {node_count} ({node_counts['SYSTEM']} systems, {node_counts['ORGAN']} organs, {node_counts['SUBSTRUCTURE']} substructures)
- Graph Edges: {edge_count} hierarchical relationships
- Total Overlays: {overlay_count}

**Association Statistics:**
- Evidence Distribution:
  * HIGH quality: {evidence_counts['HIGH']} ({evidence_counts['HIGH']/max(overlay_count,1)*100:.1f}%)
  * MEDIUM quality: {evidence_counts['MEDIUM']} ({evidence_counts['MEDIUM']/max(overlay_count,1)*100:.1f}%)
  * LOW quality: {evidence_counts['LOW']} ({evidence_counts['LOW']/max(overlay_count,1)*100:.1f}%)

- Intensity Metrics:
  * Minimum: {intensity_stats['min']:.3f}
  * Maximum: {intensity_stats['max']:.3f}
  * Mean: {intensity_stats['avg']:.3f}

**Overlay Distribution:**
- Unique structures affected: {len(overlay_by_target)}
- Most affected structure: {most_affected[0]} ({len(most_affected[1])} associations)
- Average associations per affected structure: {overlay_count / max(len(overlay_by_target), 1):.2f}

**Graph Structure:**
The visualization uses a hierarchical anatomy model with three levels:
1. SYSTEM level: Major body systems (e.g., cardiovascular, nervous)
2. ORGAN level: Specific organs within systems
3. SUBSTRUCTURE level: Detailed anatomical components

Edges represent "contains" relationships forming an anatomical hierarchy.

**Data Processing Pipeline:**
1. Genomic variants loaded from sample
2. Variants normalized (chromosome naming, position)
3. Mapping rules applied to generate associations
4. Overlays created with evidence labels and intensity scores
5. Graph sorted deterministically for reproducibility

**Compliance:**
All associations include explicit evidence quality labels (HIGH/MEDIUM/LOW) and source
references. This ensures transparency about data certainty and prevents misinterpretation
as medical advice.

**Educational Use Only:**
This technical analysis is provided for research and educational visualization purposes.
It represents associations from current genomic-anatomic models, not medical predictions
or recommendations.
""".strip()


def generate_explanation(
    anatomy_graph: Dict,
    style: ExplanationStyle = ExplanationStyle.DETAILED,
    user_question: Optional[str] = None
) -> Dict[str, any]:
    """
    Generate deterministic explanation of anatomy graph.

    Args:
        anatomy_graph: AnatomyGraph dictionary from backend
        style: Explanation verbosity level
        user_question: Optional user question (currently ignored in deterministic mode)

    Returns:
        Dictionary with:
        - explanation_text: Generated explanation
        - style: Style used
        - safety_labels: Safety/compliance labels
        - method: "deterministic"
    """
    # Generate explanation based on style
    if style == ExplanationStyle.CONCISE:
        explanation = explain_concise(anatomy_graph)
    elif style == ExplanationStyle.TECHNICAL:
        explanation = explain_technical(anatomy_graph)
    else:  # DETAILED
        explanation = explain_detailed(anatomy_graph)

    # Add safety labels
    safety_labels = [
        "Educational/research purposes only",
        "Not for medical diagnosis or treatment",
        "Evidence-labeled associations",
        "Generated from deterministic model"
    ]

    return {
        "explanation_text": explanation,
        "style": style.value,
        "safety_labels": safety_labels,
        "method": "deterministic",
        "citations_used": [
            f"Association rules version {anatomy_graph.get('rulesVersion', 'unknown')}"
        ]
    }


# Simple test
if __name__ == "__main__":
    # Test with sample anatomy graph
    test_graph = {
        "sampleId": 1,
        "rulesVersion": "1.0.0",
        "nodes": [
            {"id": "heart", "type": "ORGAN", "label": "Heart"},
            {"id": "cardiovascular_system", "type": "SYSTEM", "label": "Cardiovascular System"},
            {"id": "left_ventricle", "type": "SUBSTRUCTURE", "label": "Left Ventricle"}
        ],
        "edges": [
            {"from": "cardiovascular_system", "to": "heart", "relation": "contains"},
            {"from": "heart", "to": "left_ventricle", "relation": "contains"}
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
            }
        ]
    }

    print("=== CONCISE ===")
    result = generate_explanation(test_graph, ExplanationStyle.CONCISE)
    print(result["explanation_text"])

    print("\n=== DETAILED ===")
    result = generate_explanation(test_graph, ExplanationStyle.DETAILED)
    print(result["explanation_text"])

    print("\n=== TECHNICAL ===")
    result = generate_explanation(test_graph, ExplanationStyle.TECHNICAL)
    print(result["explanation_text"])
