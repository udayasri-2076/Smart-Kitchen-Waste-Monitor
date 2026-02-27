# 🍽️ Smart Kitchen Waste Monitor

Smart Kitchen Waste Monitor is an AI-powered web application that predicts restaurant food waste and recommends optimal ordering quantities using Machine Learning.

This system helps restaurants reduce food waste and improve profitability by analyzing:

* Customer count
* Temperature
* Rain conditions
* Holidays/Events

---

## 🚀 Features

✅ Predict food waste using Machine Learning
✅ Predict restaurant sales
✅ Recommend order quantities
✅ Simple web interface
✅ Real-time predictions
✅ AI-based decision support

---

## 🧠 Machine Learning Model

The system uses **Linear Regression** trained on restaurant data.

### Input Features

* Customers
* Temperature
* Rain
* Holiday/Event

### Output

* Predicted Sales
* Predicted Waste
* Recommended Order Quantity

---

## 🛠 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Vite

### Backend

* Python
* Flask

### Machine Learning

* Pandas
* NumPy
* Scikit-learn

---

## 📂 Project Structure

```
Smart-Kitchen-Waste-Monitor/

│
├── backend/
│   ├── app.py
│   ├── sales.csv
│   ├── sales_one_hot_encoding.csv
│   └── sales_with_extra_features.csv
│
├── public/
├── src/
│
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── vite.config.ts
│
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/udayasri-2076/Smart-Kitchen-Waste-Monitor.git
```

```
cd Smart-Kitchen-Waste-Monitor
```

---

## ▶️ Run Backend

Install dependencies:

```
pip install flask pandas numpy scikit-learn flask-cors
```

Run server:

```
python backend/app.py
```

Server runs on:

```
http://127.0.0.1:5000
```

---

## ▶️ Run Frontend

Install Node modules:

```
npm install
```

Run frontend:

```
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 📊 Dataset Example

```
Customers,Temperature,Rain,Holiday,Sales,Waste
50,30,0,0,200,10
80,25,1,1,400,25
40,35,0,0,150,5
100,28,1,1,500,30
```

---

## 📈 How It Works

1. User enters:

* Customers
* Temperature
* Rain
* Holiday/Event

2. AI model predicts:

* Sales
* Waste

3. System recommends:

* Optimal order quantity

---

## 🎯 Problem Solved

Restaurants often waste food due to incorrect demand estimation.

This project:

* Reduces food waste
* Saves money
* Improves planning
* Uses AI for decision making

---

## 🏆 Hackathon Project

Built as a real-world AI solution to reduce restaurant food waste.

---

## 👨‍💻 Author

**Udayasri Simma**

GitHub:
https://github.com/udayasri-2076

LinkedIn:
https://www.linkedin.com/in/udayasri-simma-b0541b331/

---
