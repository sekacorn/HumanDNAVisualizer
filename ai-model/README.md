# AI Trait Predictor Service

PyTorch-based AI service for predicting health risks, cognitive traits, and ancestry based on genomic, phenotypic, and environmental data.

## Features

- **Health Risk Predictions**: Type 2 Diabetes, Cardiovascular Disease
- **Cognitive Traits**: Memory and Cognitive Function
- **Metabolic Traits**: Vitamin D Metabolism, Caffeine Metabolism
- **Personalized Recommendations**: Based on genetic profile and lifestyle

## Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

```bash
cd ai-model
pip install -r requirements.txt
```

### Running the Service

**Windows:**
```bash
run-dev.bat
```

**Linux/Mac:**
```bash
chmod +x run-dev.sh
./run-dev.sh
```

**Or manually:**
```bash
python trait_predictor.py
```

The service will start on **http://localhost:8000**

## API Endpoints

### 1. Root Endpoint
```
GET http://localhost:8000/
```

**Response:**
```json
{
  "message": "DNA Trait Predictor API",
  "status": "running"
}
```

### 2. Health Check
```
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 3. Predict Traits
```
POST http://localhost:8000/predict?user_id=demo
Content-Type: application/json

{
  "variants": [
    {
      "chromosome": "1",
      "position": "10177",
      "alternateAllele": "AC"
    }
  ],
  "phenotypic_data": {
    "bloodGlucose": 5.4,
    "bloodPressure": "120/80",
    "cholesterol": 4.5
  },
  "environmental_data": {
    "diet": "vegetarian",
    "exerciseFrequency": "weekly",
    "smokingStatus": "never",
    "stressLevel": "low"
  }
}
```

**Response:**
```json
{
  "user_id": "demo",
  "predictions": [
    {
      "trait_name": "Type 2 Diabetes Risk",
      "risk_level": "Low",
      "confidence": 0.85,
      "description": "Low genetic predisposition to Type 2 Diabetes",
      "recommendations": [
        "Maintain healthy diet with low sugar intake",
        "Regular physical activity (150+ minutes/week)",
        "Monitor blood glucose levels annually"
      ]
    },
    {
      "trait_name": "Cardiovascular Disease Risk",
      "risk_level": "Moderate",
      "confidence": 0.72,
      "description": "Increased genetic susceptibility to cardiovascular disease",
      "recommendations": [
        "Heart-healthy diet rich in omega-3 fatty acids",
        "Regular cardiovascular exercise",
        "Monitor blood pressure and cholesterol"
      ]
    }
  ],
  "overall_risk_score": 0.35
}
```

### 4. Interactive API Documentation

Visit **http://localhost:8000/docs** for interactive Swagger UI documentation where you can test all endpoints directly from your browser.

## Model Architecture

The service uses a simple PyTorch neural network:

- **Input Layer**: 100 features (genomic variants, phenotypic data, environmental factors)
- **Hidden Layers**: 2 layers with 64 neurons each, ReLU activation
- **Output Layer**: 10 trait predictions, Sigmoid activation
- **Architecture**: Fully connected feed-forward neural network

### Feature Processing

1. **Genomic Variants** (50 features): Hash-encoded alternate alleles
2. **Phenotypic Data** (25 features): Normalized health metrics
3. **Environmental Data** (25 features): Lifestyle factors with predefined mappings

## Traits Predicted

| Trait | Description | Output |
|-------|-------------|--------|
| Type 2 Diabetes Risk | Genetic predisposition to diabetes | Low/Moderate/High |
| Cardiovascular Disease Risk | Heart disease susceptibility | Low/Moderate/High |
| Memory & Cognitive Function | Cognitive performance markers | Low/Moderate/High |
| Vitamin D Metabolism | Vitamin D processing efficiency | Low/Moderate/High |
| Caffeine Metabolism | Caffeine metabolization speed | Slow/Moderate/Fast |

## Testing

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Predict traits
curl -X POST "http://localhost:8000/predict?user_id=testuser" \
  -H "Content-Type: application/json" \
  -d '{
    "variants": [{"chromosome":"1","position":"10177","alternateAllele":"AC"}],
    "phenotypic_data": {"bloodGlucose": 5.4},
    "environmental_data": {"diet": "vegetarian", "smokingStatus": "never"}
  }'
```

### Using Python

```python
import requests

# Health check
response = requests.get('http://localhost:8000/health')
print(response.json())

# Predict traits
data = {
    "variants": [
        {"chromosome": "1", "position": "10177", "alternateAllele": "AC"}
    ],
    "phenotypic_data": {"bloodGlucose": 5.4},
    "environmental_data": {"diet": "vegetarian", "smokingStatus": "never"}
}

response = requests.post(
    'http://localhost:8000/predict?user_id=testuser',
    json=data
)
print(response.json())
```

## Integration with Backend

The backend DNA Integrator service calls this AI service after uploading genomic data:

1. User uploads VCF file to backend
2. Backend parses genomic variants
3. Backend calls AI service at `http://localhost:8000/predict`
4. AI service returns trait predictions
5. Backend stores predictions and sends to frontend

## Dependencies

- **FastAPI** (0.104.1): Modern web framework for building APIs
- **Uvicorn** (0.24.0): ASGI server for running FastAPI
- **PyTorch** (2.1.0): Deep learning framework for neural networks
- **NumPy** (1.24.3): Numerical computing library
- **Pandas** (2.0.1): Data manipulation and analysis
- **BioPython** (1.81): Computational biology tools
- **Pydantic** (2.4.2): Data validation using Python type hints
- **scikit-learn** (1.3.1): Machine learning utilities

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `INFO` | Logging level |

## Model Training (Future Enhancement)

Currently using a simple untrained model for demonstration. Future versions will include:

- Pre-trained models on genomic datasets
- Transfer learning from existing genetic databases
- Fine-tuning on user data with consent
- Regular model updates with new research

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:

```bash
# Find and kill the process
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
kill -9 <PID>

# Or change the port
uvicorn trait_predictor:app --host 0.0.0.0 --port 8001
```

### Dependencies Not Installed

```bash
pip install -r requirements.txt
```

### PyTorch Installation Issues

If PyTorch installation fails, try:

```bash
# CPU-only version (smaller, faster install)
pip install torch==2.1.0 --index-url https://download.pytorch.org/whl/cpu
```

## Development

### Adding New Traits

1. Add trait definition to `trait_definitions` in `interpret_predictions()`
2. Update model output size if needed
3. Add corresponding recommendations

### Improving Model

1. Collect training data (genomic variants + known traits)
2. Train model using PyTorch
3. Save trained weights
4. Load weights in `model = TraitPredictorModel()`

## License

MIT License - See parent project for details

## Support

For issues or questions, see the main project documentation.
