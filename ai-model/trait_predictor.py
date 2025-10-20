"""
AI Service for Trait Predictions
Uses PyTorch for predicting health risks, cognitive traits, and ancestry
Based on genomic, phenotypic, and environmental data
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import torch
import torch.nn as nn
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DNA Trait Predictor", version="1.0.0")


class GenomicInput(BaseModel):
    variants: List[Dict[str, str]]
    phenotypic_data: Optional[Dict[str, any]] = None
    environmental_data: Optional[Dict[str, str]] = None


class TraitPrediction(BaseModel):
    trait_name: str
    risk_level: str
    confidence: float
    description: str
    recommendations: List[str]


class PredictionResponse(BaseModel):
    user_id: str
    predictions: List[TraitPrediction]
    overall_risk_score: float


# Simple Neural Network for trait prediction
class TraitPredictorModel(nn.Module):
    def __init__(self, input_size=100, hidden_size=64, output_size=10):
        super(TraitPredictorModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(hidden_size, output_size)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.fc3(x)
        x = self.sigmoid(x)
        return x


# Initialize model
model = TraitPredictorModel()
model.eval()


def process_genomic_data(genomic_input: GenomicInput) -> np.ndarray:
    """
    Process genomic, phenotypic, and environmental data into feature vector
    """
    features = np.zeros(100)

    # Process variants (simplified encoding)
    for i, variant in enumerate(genomic_input.variants[:50]):
        if 'alternateAllele' in variant:
            # Simple hash encoding
            allele_hash = hash(variant['alternateAllele']) % 2
            features[i] = allele_hash

    # Process phenotypic data
    if genomic_input.phenotypic_data:
        idx = 50
        for key, value in genomic_input.phenotypic_data.items():
            if idx < 75:
                try:
                    features[idx] = float(value) if isinstance(value, (int, float)) else hash(str(value)) % 10 / 10.0
                    idx += 1
                except:
                    pass

    # Process environmental data
    if genomic_input.environmental_data:
        idx = 75
        lifestyle_mapping = {
            'diet': {'vegetarian': 0.3, 'vegan': 0.2, 'omnivore': 0.7},
            'exerciseFrequency': {'daily': 0.9, 'weekly': 0.6, 'monthly': 0.3, 'rarely': 0.1},
            'smokingStatus': {'never': 0.1, 'former': 0.5, 'current': 0.9},
            'stressLevel': {'low': 0.2, 'moderate': 0.5, 'high': 0.8}
        }

        for key, value in genomic_input.environmental_data.items():
            if idx < 100 and key in lifestyle_mapping:
                features[idx] = lifestyle_mapping[key].get(value, 0.5)
                idx += 1

    return features


def interpret_predictions(predictions: torch.Tensor) -> List[TraitPrediction]:
    """
    Convert model predictions to interpretable trait predictions
    """
    trait_definitions = [
        {
            'name': 'Type 2 Diabetes Risk',
            'low_desc': 'Low genetic predisposition to Type 2 Diabetes',
            'high_desc': 'Elevated genetic risk for Type 2 Diabetes',
            'recommendations': [
                'Maintain healthy diet with low sugar intake',
                'Regular physical activity (150+ minutes/week)',
                'Monitor blood glucose levels annually'
            ]
        },
        {
            'name': 'Cardiovascular Disease Risk',
            'low_desc': 'Lower genetic risk for cardiovascular issues',
            'high_desc': 'Increased genetic susceptibility to cardiovascular disease',
            'recommendations': [
                'Heart-healthy diet rich in omega-3 fatty acids',
                'Regular cardiovascular exercise',
                'Monitor blood pressure and cholesterol'
            ]
        },
        {
            'name': 'Memory and Cognitive Function',
            'low_desc': 'Average genetic cognitive performance markers',
            'high_desc': 'Enhanced genetic markers for memory and cognition',
            'recommendations': [
                'Engage in mentally stimulating activities',
                'Maintain social connections',
                'Get adequate sleep (7-9 hours)'
            ]
        },
        {
            'name': 'Vitamin D Metabolism',
            'low_desc': 'Normal vitamin D processing',
            'high_desc': 'May require vitamin D supplementation',
            'recommendations': [
                'Get regular sunlight exposure',
                'Consider vitamin D supplementation',
                'Eat vitamin D-rich foods'
            ]
        },
        {
            'name': 'Caffeine Metabolism',
            'low_desc': 'Slow caffeine metabolizer',
            'high_desc': 'Fast caffeine metabolizer',
            'recommendations': [
                'Moderate caffeine intake based on metabolism',
                'Avoid caffeine late in the day',
                'Monitor sensitivity to caffeine'
            ]
        }
    ]

    results = []
    pred_values = predictions.detach().numpy()[0]

    for i, trait_def in enumerate(trait_definitions):
        if i < len(pred_values):
            risk_value = float(pred_values[i])
            risk_level = 'Low' if risk_value < 0.33 else ('Moderate' if risk_value < 0.66 else 'High')
            description = trait_def['high_desc'] if risk_value > 0.5 else trait_def['low_desc']

            results.append(TraitPrediction(
                trait_name=trait_def['name'],
                risk_level=risk_level,
                confidence=min(abs(risk_value - 0.5) * 2, 1.0),
                description=description,
                recommendations=trait_def['recommendations']
            ))

    return results


@app.get("/")
def root():
    return {"message": "DNA Trait Predictor API", "status": "running"}


@app.post("/predict", response_model=PredictionResponse)
def predict_traits(user_id: str, genomic_input: GenomicInput):
    """
    Predict health and cognitive traits based on genomic, phenotypic, and environmental data
    """
    try:
        logger.info(f"Processing prediction for user: {user_id}")

        # Process input data
        features = process_genomic_data(genomic_input)
        features_tensor = torch.FloatTensor(features).unsqueeze(0)

        # Make prediction
        with torch.no_grad():
            predictions = model(features_tensor)

        # Interpret results
        trait_predictions = interpret_predictions(predictions)

        # Calculate overall risk score
        overall_risk = sum(1 if p.risk_level == 'High' else 0.5 if p.risk_level == 'Moderate' else 0
                           for p in trait_predictions) / len(trait_predictions)

        return PredictionResponse(
            user_id=user_id,
            predictions=trait_predictions,
            overall_risk_score=overall_risk
        )

    except Exception as e:
        logger.error(f"Error processing prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
