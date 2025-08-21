# 🧠 MindMate AI – Your Mental Health Companion

MindMate is an AI-powered mental health chatbot system developed as my Final Year Project for BS Computer Science. The project aims to provide accessible, empathetic, and intelligent mental health support using modern technologies like NLP, AI, and interactive web platforms.

---

## 🏗️ Project Structure

MindMate is composed of four intelligent agents that work together to simulate a virtual mental health assistant:

### 1. **PIMA** - Patients Interaction and Management Agent
- Acts as the primary chatbot interface
- Engages users in natural conversations
- Gathers information and asks follow-up questions empathetically

### 2. **SRDA** - Symptom Recognizer and Diagnosis Agent
- Identifies and categorizes mental health symptoms
- Maps responses to standardized criteria
- Predicts possible conditions with confidence scores
- Routes to:
  - **TPA** if high confidence
  - Requests more info or refers to **SMA** if low confidence

### 3. **TPA** - Treatment Planning Agent
- Creates personalized treatment plans
- Provides educational material and self-help guidance

### 4. **SMA** - Specialist Matching Agent
- Matches users with licensed professionals
- Schedules appointments
- Generates detailed reports based on the chat session

---

## 💻 Tech Stack

### 🧠 Backend
- **FastAPI** – for APIs and logic of all agents
- **PostgreSQL** – user data and questionnaire storage
- **Authlib** – Google and Facebook OAuth2 login
- **Hugging Face API** – for conversational AI (Zephyr-7B or similar)

### 🌐 Frontend
- **React.js** with **Next.js**
- **Tailwind CSS** + **shadcn/ui** – sleek, responsive design
- **Framer Motion** – smooth animations
- **React Feather Icons** – modern UI icons

---

## 🚀 Features

- 🗨️ Conversational chatbot for mental health check-ins  
- 🤖 AI-powered symptom analysis and response routing  
- 🧑‍⚕️ Specialist matching and appointment scheduling  
- 🔐 Secure login with JWT + Google/Facebook OAuth  
- 📊 Dynamic questionnaires and intelligent data handling  

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/77b572d8-6c1f-4043-b47c-d1ceec960c8e)
![Screenshot 2025-07-06 113226](https://github.com/user-attachments/assets/e59f3a62-8537-4907-9629-ae51ef665085)
![image](https://github.com/user-attachments/assets/0ab26478-48f1-4770-91c9-178652551114)



---

