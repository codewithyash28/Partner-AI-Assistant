
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

## 📜 MIT License

Copyright (c) 2024 [Hackathon Team Name]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
