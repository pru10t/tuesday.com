# Tomorrow 🔮

**What if you could see the future before making a decision?**

That's exactly what Tomorrow does.

---

## Digital Twins

Ever wish you could test an email campaign *before* sending it to real customers? We built 10,000 AI replicas of actual customers. Send your campaign to them first. See who opens, who clicks, who converts—and who might unsubscribe.

No more guessing. No more "let's A/B test and hope." Just answers, in under a second.

**4 ML models. 10K customer twins. <800ms to know if your campaign works.**

---

## Project Simulator

Planning a project is hard. Timelines slip, dependencies break, and nobody knows what happens if one task runs late.

We connected a Gantt chart to Gemini AI. Drag a task, and it tells you the ripple effects. Add a delay scenario, and watch the timeline recalculate. It's like having a project manager who's actually thought about *what could go wrong*.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd digital-twins

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
cd backend
uvicorn main:app --reload --port 8000
```

The API will be running at `http://localhost:8000`

### Frontend Setup

Open a new terminal:

```bash
cd digital-twins/frontend

# Install dependencies
npm install

# Create a .env file for Gemini API (for Project Simulator AI features)
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# Start the dev server
npm run dev
```

### Open the App

Head to **http://localhost:5173**

You'll land on our homepage. Click "Start Simulating" to enter the dashboard, where you can switch between Digital Twins and Project Simulator.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind, Framer Motion
- **Backend**: FastAPI, Python, Scikit-Learn
- **AI**: Gradient Boosting Classifiers, Google Gemini

---

*Built because we were tired of launching things and hoping for the best.*
