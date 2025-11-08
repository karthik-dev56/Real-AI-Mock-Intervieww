# 🎙️ Voice-Driven Mock Interview AI (2025)

A **full-stack, voice-driven AI interview platform** that conducts **real-time mock interviews** for recruiters and candidates.  
Built with **Next.js, Convex, n8n, Clerk, Arcjet, and shadcn/ui**, this platform leverages **speech recognition and NLP** to simulate intelligent, adaptive interview sessions — complete with **scoring, analytics, and AI feedback**.

🌐 **Live Demo:** [https://real-ai-mock-intervieww.vercel.app/](https://real-ai-mock-intervieww.vercel.app/)

---

## 🚀 Features

- 🎤 **Voice-Driven Interviews:** Real-time audio input and processing powered by **Vapi** for accurate speech recognition.  
- 🧠 **AI-Powered Feedback:** Uses **Natural Language Processing (NLP)** to evaluate answers and generate intelligent, context-aware responses.  
- 📊 **Adaptive Scoring System:** Scores candidates **out of 20** based on tone, clarity, confidence, and content quality.  
- ⚙️ **Automation with n8n:** Fully automated workflows for scheduling, report generation, and result delivery.  
- 🧮 **Optimized Processing:** Implements **queues, tries, and hash maps** for efficient real-time data lookup and handling.  
- 💬 **Recruiter Dashboard:** Manage interviews, analyze performance metrics, and review AI-generated feedback.  
- 🌗 **Responsive UI:** Built with **Next.js (CSR + SSR)** and **shadcn/ui** for a seamless, fast, and elegant user experience.  

---

## 🏗️ Tech Stack

| Category | Tools & Frameworks |
|-----------|--------------------|
| **Frontend** | Next.js (CSR + SSR), React, shadcn/ui, Tailwind CSS |
| **Backend** | Convex, Node.js |
| **Automation** | n8n |
| **Authentication & Security** | Clerk, Arcjet |
| **Voice & AI** | Vapi (speech recognition), NLP-based evaluation |
| **Deployment** | Vercel |

---

## 🧩 Project Structure

Real-AI-Mock-Intervieww/
│
├── app/ # Next.js pages and routes
├── components/ # UI components (shadcn/ui)
├── convex/ # Convex backend functions
├── public/ # Static assets
├── styles/ # Tailwind & global CSS
├── .env.local # Environment variables (to be created)
├── package.json # Dependencies and scripts
└── README.md # Documentation


---

## ⚙️ Local Setup Guide

Follow these steps to set up and run the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/karthik-dev56/Real-AI-Mock-Intervieww

2️⃣ Navigate to the Project Directory

cd Real-AI-Mock-Intervieww

3️⃣ Install Node.js (Latest Version)

Make sure you have Node.js (LTS or latest) installed.

Check your versions:

node --version
npm --version

If not installed, download from:
👉 https://nodejs.org/en/download
4️⃣ Setup Environment Variables

Create a file named .env.local in the root directory and add the following:

NEXT_PUBLIC_VAPI_PUBLIC_KEY=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_URL_PUBLIC_KEY=
IMAGEKIT_URL_PRIVATE_KEY=
ARCJET_KEY=

    ⚠️ Ensure all API keys are correctly configured for Convex, Clerk, Vapi, Arcjet, and ImageKit.

5️⃣ Install Dependencies

npm install

6️⃣ Run the Development Server

npm run dev

Then open your browser and navigate to:
👉 https://localhost:3000
📈 Future Enhancements

    🎧 Real-time AI interviewer personality customization

    📅 Calendar integration with Google & Outlook

    🧾 Auto-generated detailed PDF reports

    🗣️ Multilingual interview support

    🤖 Integration with OpenAI GPT models for deeper semantic evaluation

🧑‍💻 Author

Karthik Dev
🔗 GitHub

📧 Email
🪪 License

This project is licensed under the MIT License — feel free to modify and distribute it as per the terms.

⭐ If you like this project, consider giving it a star on GitHub!


---

Would you like me to add **GitHub badges** (e.g., Next.js, Convex, Vercel, MIT License) and a **preview image banner** section at the top for visual appeal? It can make your README stand out and look more professional.

