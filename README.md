
# 🚀 Partner AI Assistant

**Empowering Google Cloud Partners with Instant, Expert-Level Solution Architecture.**

Built for the Google Cloud Hackathon, this tool uses the **Gemini 3 Flash** model to transform vague business requirements into detailed, technically sound Google Cloud Platform (GCP) architectures.

## ✨ Features

- **Business Problem Analysis**: Input raw client challenges and business requirements.
- **Service Mapping**: Automatically identifies the best GCP products for the job (e.g., GKE, Spanner, BigQuery).
- **Architecture Blueprints**: Provides a descriptive walkthrough of how services connect.
- **Best Practices**: Includes automated checks for security, scalability, and cost-efficiency.
- **Architect Notes**: "Real-world" advice from an AI trained to act as a Senior Cloud Solutions Architect.

## 🛠 Tech Stack

- **Frontend**: React (TSX), Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Hosting**: Designed for Firebase Hosting / Vercel
- **Styling**: Modern, Clean UI with Google Font "Google Sans"

## 🚀 Getting Started

### Prerequisites

- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### Local Development

1. **Clone the project** to your local environment.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure the Environment**:
   This app expects the Gemini API key to be available. Since this is a browser-based SPA for hackathon purposes, the key is pulled from the environment.
   
4. **Run the app**:
   ```bash
   npm start
   ```

## 🏆 Deployment

### Firebase Hosting
```bash
firebase init
firebase deploy
```

