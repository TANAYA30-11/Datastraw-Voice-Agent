from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI(
    title="Aura Skincare AI Voice Agent",
    description="AI Voice Customer Support Agent for Aura Skincare",
    version="1.0.0"
)
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/app")
def serve_frontend():
    return FileResponse(str(STATIC_DIR / "index.html"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ORDERS = {
    "ORD-101": {
        "customer_name": "Priya Sharma",
        "items": ["Vitamin C Serum"],
        "total": 699,
        "status": "Out for Delivery",
        "courier": "BlueDart",
        "tracking_id": "BD-982103",
        "expected_delivery": "Today by 6 PM"
    },
    "ORD-102": {
        "customer_name": "Rahul Verma",
        "items": ["Hydrating Sunscreen SPF 50"],
        "total": 499,
        "status": "Delivered",
        "courier": "Delhivery",
        "tracking_id": "DL-441029",
        "expected_delivery": "Delivered 14 days ago"
    },
    "ORD-103": {
        "customer_name": "Ananya Patel",
        "items": ["Green Tea Face Wash", "Toner"],
        "total": 850,
        "status": "Processing",
        "courier": None,
        "tracking_id": None,
        "expected_delivery": "Not yet shipped"
    }
}


@app.get("/")
def home():
    return {
        "message": "Aura Skincare AI Voice Agent API is running!",
        "status": "success"
    }


@app.get("/orders/{order_id}")
def get_order_details(order_id: str):
    order_id = order_id.strip().upper()
    order = ORDERS.get(order_id)

    if order is None:
        return {
            "success": False,
            "message": "Order not found. Please check your order ID."
        }

    return {
        "success": True,
        "order_id": order_id,
        "order": order
    }


@app.get("/policies")
def get_policies():
    return {
        "shipping": "Free for orders above ₹499; otherwise ₹50.",
        "delivery": "Standard delivery takes 3–5 business days.",
        "returns": "Returns within 7 days for unopened and unused products in original packaging.",
        "damaged_orders": "Report damaged or defective products within 48 hours with photos.",
        "cancellation": "Orders can be cancelled only while Processing.",
        "cod": "Cash on Delivery is available up to ₹2500, by cash or UPI."
    }

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def ai_chat(request: ChatRequest):
    user_msg = request.message.lower()
    
    # Simple rule-based/AI guardrail to prevent hallucination and answer accurately
    if "cancel" in user_msg:
        # Check for order id in message or general policy
        for oid, order in ORDERS.items():
            if oid.lower() in user_msg or order["customer_name"].lower() in user_msg:
                if order["status"] == "Processing":
                    return {"response": f"Yes, order {oid} is currently Processing and is eligible for cancellation. Would you like me to cancel it for you?"}
                else:
                    return {"response": f"Sorry, order {oid} is status '{order['status']}', so it cannot be cancelled according to our policy."}
        return {"response": "To check cancellation eligibility, please mention your Order ID like ORD-103."}

    elif "status" in user_msg or "track" in user_msg or "order" in user_msg:
        for oid, order in ORDERS.items():
            if oid.lower() in user_msg:
                return {"response": f"Order {oid} for {order['customer_name']} containing {', '.join(order['items'])} is currently '{order['status']}'. Expected delivery: {order['expected_delivery']}."}
        return {"response": "Please provide your Order ID (such as ORD-101, ORD-102, or ORD-103) to check its tracking status."}

    elif "return" in user_msg:
        return {"response": "Our return policy allows returns within 7 days for unopened and unused products in their original packaging."}
    
    elif "shipping" in user_msg or "delivery" in user_msg:
        return {"response": "Shipping is free for orders above ₹499; otherwise it is ₹50. Standard delivery takes 3 to 5 business days."}
    
    elif "damage" in user_msg:
        return {"response": "Please report damaged or defective products within 48 hours of delivery along with clear photos."}

    else:
        return {"response": "I am Aria from Aura Skincare. I can help you check order statuses, cancellation eligibility, and brand policies. What would you like to know?"}    
