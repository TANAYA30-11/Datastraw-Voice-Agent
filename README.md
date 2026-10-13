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
1. Why did you choose your particular architecture and technology stack?
 * Modular Pipeline: I chose a modular architecture (STT → LLM Reasoning/Tool Calling → TTS) to maintain granular control over latency, prompt guardrails, and debugging at each layer.
 * Browser-Native Experience: Leveraging native browser APIs (such as the Web Audio API / MediaRecorder) enables real-time, low-latency audio capture and playback directly in the browser without telephony overhead.
 * Function Calling: Using native LLM tool-calling reliably extracts order IDs and triggers get_order_details(order_id) seamlessly during live conversation.
2. What was the most difficult part of the assignment, and how did you solve it?
 * Challenge: Minimizing conversational latency and preventing hallucinations during ambiguous or invalid user inputs (such as missing or mistyped order IDs).
 * Solution:
   * Tuned the system prompt to enforce concise, single-sentence spoken responses.
   * Implemented strict fallback validation logic so the agent gracefully clarifies missing information instead of fabricating details or failing.
3. If you had one more week to work on this, what would you improve first and why?
 * Barge-in / Interruption Handling: Allow users to interrupt Aria mid-speech to make conversational pacing feel significantly more human and responsive.
 * Hinglish & Multilingual Support: Enhance tokenization and speech synthesis for Hinglish to better serve Indian D2C customers.
 * Transactional Tools: Introduce state-modifying tools like cancel_order or initiate_return directly linked to order status logic.
4. Imagine this agent is handling 1,000 customer conversations a day. What do you think would need to change or improve?
 * Concurrency & Streaming: Migrate to full duplex WebSockets with horizontal auto-scaling container instances to handle concurrent audio sessions reliably.
 * Caching & Cost Optimization: Implement semantic caching (e.g., Redis) for repetitive policy queries to reduce LLM token usage and latency.
 * Production Database & Security: Replace the mock dataset with a secure, rate-limited relational database (e.g., PostgreSQL).
 * Observability: Integrate end-to-end tracing (such as OpenTelemetry or LangSmith) to monitor fallback rates, audio packet drops, and policy adherence in real time.

