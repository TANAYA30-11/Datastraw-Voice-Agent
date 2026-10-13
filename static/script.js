const orderForm = document.getElementById("orderForm");
const orderInput = document.getElementById("orderId");
const orderResult = document.getElementById("orderResult");
const transcript = document.getElementById("transcript");
const summaryElement = document.getElementById("summary");
const downloadButton = document.getElementById("downloadSummary");

let summary = {
    status: "Waiting for call",
    customer_intent: null,
    order_id: null,
    resolution_status: null,
    call_summary: null
};

let conversation = [];

function showSummary() {
    summaryElement.textContent = JSON.stringify(summary, null, 2);
}

function addMessage(speaker, message) {
    const empty = transcript.querySelector(".empty-state");
    if (empty) empty.remove();

    const item = document.createElement("div");
    item.className = "message " +
        (speaker === "Customer" ? "customer-message" : "agent-message");

    const title = document.createElement("strong");
    title.textContent = speaker + ": ";

    const text = document.createElement("span");
    text.textContent = message;

    item.append(title, text);
    transcript.appendChild(item);
    transcript.scrollTop = transcript.scrollHeight;

    conversation.push({ speaker, message });
}

async function lookupOrder(orderId) {
    const id = orderId.trim().toUpperCase();

    if (!id) {
        orderResult.textContent = "Please enter an order ID.";
        return;
    }

    orderResult.textContent = "Looking up order...";

    try {
        const response = await fetch(
            `/orders/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error("Could not contact the order service.");
        }

        const data = await response.json();

        if (!data.success) {
            orderResult.textContent = data.message;
            return;
        }

        const order = data.order;

        orderResult.textContent =
            `Order: ${data.order_id}\n` +
            `Customer: ${order.customer_name}\n` +
            `Items: ${order.items.join(", ")}\n` +
            `Total: ₹${order.total}\n` +
            `Status: ${order.status}\n` +
            `Courier: ${order.courier || "Not assigned yet"}\n` +
            `Tracking ID: ${order.tracking_id || "Not available"}\n` +
            `Delivery: ${order.expected_delivery}`;

        summary = {
            status: "Order lookup completed",
            customer_intent: "ORDER_TRACKING",
            order_id: data.order_id,
            resolution_status: "RESOLVED",
            call_summary: `Checked order ${data.order_id}. Current status: ${order.status}.`
        };

        showSummary();
        downloadButton.disabled = false;

    } catch (error) {
        orderResult.textContent =
            "Unable to connect to the backend. Check that the server is running.";
        console.error(error);
    }
}

orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    lookupOrder(orderInput.value);
});

document.querySelectorAll(".order-item").forEach((item) => {
    item.addEventListener("click", () => {
        const id = item.dataset.order;
        orderInput.value = id;
        lookupOrder(id);
    });
});

downloadButton.addEventListener("click", () => {
    const file = new Blob(
        [JSON.stringify(summary, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "aura-call-summary.json";
    link.click();

    URL.revokeObjectURL(url);
});

showSummary();

// --- Voice Agent Integration (Speech Recognition & Speech Synthesis) ---

const startCallBtn = document.getElementById("startCall");
const endCallBtn = document.getElementById("endCall");
const micButton = document.getElementById("micButton");
const callStatus = document.getElementById("callStatus");
const voiceTitle = document.getElementById("voiceTitle");
const voiceMessage = document.getElementById("voiceMessage");

let recognition = null;
let isCallActive = false;

// Text-to-Speech: Aria speaks out the response
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-IN'; // Indian English accent
        window.speechSynthesis.speak(utterance);
    }
}

// Initialize Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = async function(event) {
        const userText = event.results[0][0].transcript;
        addMessage("Customer", userText);
        
        voiceMessage.textContent = `You said: "${userText}"`;
        micButton.classList.remove("listening");

        // Send to Backend AI
        try {
            callStatus.textContent = "Aria is thinking...";
            const res = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText })
            });
            const data = await res.json();
            const aiResponse = data.response;

            addMessage("Aria", aiResponse);
            voiceMessage.textContent = aiResponse;
            callStatus.textContent = "Call active (Listening...)";
            
            // Speak response
            speakText(aiResponse);

            // Update summary dynamically
            summary.status = "In conversation";
            summary.customer_intent = userText.includes("ORD") ? "ORDER_INQUIRY" : "GENERAL_SUPPORT";
            summary.call_summary = `Discussed: "${userText}". Aria responded with policy/order details.`;
            showSummary();
            downloadButton.disabled = false;

        } catch (err) {
            console.error(err);
            voiceMessage.textContent = "Server error connecting to Aria.";
            callStatus.textContent = "Error";
        }
    };

    recognition.onerror = function(event) {
        console.error(event.error);
        micButton.classList.remove("listening");
        callStatus.textContent = "Call active (Ready)";
    };

    recognition.onend = function() {
        micButton.classList.remove("listening");
        if (isCallActive) {
            callStatus.textContent = "Call active (Click mic to speak)";
        }
    };
} else {
    console.warn("Speech Recognition API not supported in this browser. Use Chrome or Edge.");
}

// Call Control Buttons
startCallBtn.addEventListener("click", () => {
    isCallActive = true;
    startCallBtn.disabled = true;
    endCallBtn.disabled = false;
    callStatus.textContent = "Call active (Click mic to speak)";
    voiceTitle.textContent = "Connected with Aria";
    voiceMessage.textContent = "Click the microphone button to start speaking.";
    
    const welcomeText = "Hello! I am Aria from Aura Skincare. How can I help you with your orders or policies today?";
    addMessage("Aria", welcomeText);
    speakText(welcomeText);
    
    summary.status = "Call in progress";
    showSummary();
});

endCallBtn.addEventListener("click", () => {
    isCallActive = false;
    startCallBtn.disabled = false;
    endCallBtn.disabled = true;
    callStatus.textContent = "Call ended";
    voiceTitle.textContent = "Talk to Aria";
    voiceMessage.textContent = "Call ended. You can download your summary below.";
    
    if (recognition) recognition.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const goodbyeText = "Thank you for calling Aura Skincare. Have a wonderful day!";
    addMessage("Aria", goodbyeText);
    speakText(goodbyeText);

    summary.status = "Completed";
    showSummary();
    downloadButton.disabled = false;
});

// Mic Button Click to Record Voice
micButton.addEventListener("click", () => {
    if (!isCallActive) {
        alert("Please click 'Start Call' first!");
        return;
    }
    if (recognition) {
        try {
            recognition.start();
            micButton.classList.add("listening");
            callStatus.textContent = "Listening to your voice...";
            voiceMessage.textContent = "Listening... Speak now.";
        } catch (e) {
            console.error(e);
        }
    } else {
        alert("Speech recognition is not supported in your browser. Please try Google Chrome.");
    }
});