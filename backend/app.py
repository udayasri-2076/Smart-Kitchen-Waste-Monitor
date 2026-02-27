from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Global variables
model = LinearRegression()
is_trained = False

def train_model():
    global model, is_trained
    file_name = 'sales_one_hot_encoding.csv'
    
    if not os.path.exists(file_name):
        print(f"❌ Error: {file_name} not found!")
        return

    try:
        # 1. AUTO-DETECT DELIMITER (Handles both , and ;)
        df = pd.read_csv(file_name, sep=None, engine='python')
        
        # 2. BILINGUAL COLUMN MAPPING
        def get_col(options, df):
            for opt in options:
                if opt in df.columns: return opt
            return None

        sales_col = get_col(['VENDAS', 'SALES'], df)
        temp_col = get_col(['TEMPERATURA', 'WEATHER_TEMPERATURE', 'TEMP'], df)
        rain_col = get_col(['PRECIPITACAO', 'WEATHER_PRECIPITATION', 'RAIN'], df)
        holiday_col = get_col(['FERIADO', 'IS_HOLIDAY'], df)

        if not all([sales_col, temp_col, rain_col, holiday_col]):
            print("❌ Error: Could not find all required columns in CSV.")
            return

        # 3. TRAINING
        X = df[[sales_col, temp_col, rain_col, holiday_col]]
        # Target: Waste calculation based on your business logic
        y = (df[sales_col] * 0.12) + (df[temp_col] * 0.4)

        model.fit(X.values, y)
        is_trained = True
        print(f"✅ AI trained using: {sales_col}, {temp_col}, {rain_col}, {holiday_col}")

    except Exception as e:
        print(f"❌ Training failed: {e}")

# Run training on startup
train_model()



@app.route('/predict', methods=['POST'])
def predict():
    if not is_trained:
        return jsonify({"error": "Model not trained"}), 500
    
    try:
        data = request.json
        # Convert incoming JSON to the exact order expected by the model
        # Order: [Sales, Temp, Rain, Holiday]
        sales = float(data.get('sales', 0))
        temp = float(data.get('temp', 25))
        rain = float(data.get('rain', 0))
        holiday = 1 if data.get('is_holiday') or data.get('holiday') else 0

        # AI Prediction
        prediction = model.predict([[sales, temp, rain, holiday]])[0]
        
        # Recommendation logic: Adjust order based on predicted waste
        recommended = sales - (prediction * 0.2)

        return jsonify({
            "predicted_waste": round(max(0, prediction), 2),
            "recommended_order": round(max(0, recommended), 0),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)