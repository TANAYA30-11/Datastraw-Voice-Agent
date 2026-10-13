# Datastraw-Voice-Agent
# Aura Skincare AI Voice Agent 🌸

A browser-based AI Voice Customer Support Agent built for the fictional D2C organic skincare brand, **Aura Skincare**[cite: 2]. This application enables customers to have a natural voice conversation to look up order details, check brand policies, and verify cancellation eligibility[cite: 2, 3].

## 🚀 Features
* **Browser-Based Voice Interaction:** Uses the native Web Speech API (Speech Recognition & Speech Synthesis) for natural voice input and response[cite: 2].
* **Order Lookup Tool:** Queries mock database (`get_order_details`) for live order tracking (`ORD-101`, `ORD-102`, `ORD-103`).
* **Brand Guardrails & Policies:** Enforces strict policy checks (returns, shipping, damages, and cancellations) to prevent hallucinations.
* **Post-Call Summary & Transcript:** Automatically records conversation transcripts and generates a structured JSON call summary available for download[cite: 4].
* **Testing Interface:** Includes a clean dashboard with test order helpers and a live state indicator[cite: 4].

---

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI, Pydantic, Uvicorn[cite: 5]
* **Frontend:** HTML5, Custom CSS, JavaScript (Web Speech API)[cite: 2, 5]
* **Deployment:** Render / Railway / Hugging Face Spaces[cite: 5]

---
