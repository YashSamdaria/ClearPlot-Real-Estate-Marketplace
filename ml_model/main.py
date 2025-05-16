from flask import Flask, request, jsonify
from house import HousePricePredictor
import traceback
from flask_cors import CORS
import pandas as pd  # Required for input DataFrame
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize the predictor
predictor = HousePricePredictor()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "success"})

@app.route("/predict", methods=["POST"])
def predict_route():
    try:
        input_data = request.get_json()

        # Predict price using HousePricePredictor instance
        prediction = predictor.predict(input_data)
        print(round(float(prediction), 2))
        return jsonify({"predicted_price":  round(float(prediction), 2)})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    

if __name__ == "__main__":
    if os.getenv("FLASK_ENV") == "production":
        pass  # Do nothing; run with Gunicorn
    else:
        app.run(host="0.0.0.0", port=5001, debug=True)

