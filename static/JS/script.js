function hideFunction() {
    const dropdownRecents = document.getElementById("dropdownRecents");
    if (!dropdownRecents) return;
    const currentDisplay = window.getComputedStyle(dropdownRecents).display;
    if (currentDisplay === "none") {
        dropdownRecents.style.display = "block";
    } else {
        dropdownRecents.style.display = "none";
    }
}

function showFunction() {
    const show = document.getElementById("show");
    if (!show) return;
    const currentDisplay = window.getComputedStyle(show).display;
    if (currentDisplay === "none") {
        dropdownRecentsDisplayBlock(show);
    } else {
        show.style.display = "none";
    }
}

function dropdownRecentsDisplayBlock(el) {
    el.style.display = "block";
}

function newShowFunction() {
    const newDropdownList = document.getElementById("newDropdownList");
    if (!newDropdownList) return;
    const currentDisplay = window.getComputedStyle(newDropdownList).display;
    if (currentDisplay === "none") {
        newDropdownList.style.display = "block";
    } else {
        newDropdownList.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");
    const introHeading = document.getElementById("intro-heading");

    if (!chatForm || !userInput || !chatMessages) return;

    function scrollToBottom() {
        const homePage = document.querySelector(".home-page");
        if (homePage) {
            homePage.scrollTop = homePage.scrollHeight;
        }
    }

    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Hide intro text after first message
        if (introHeading) {
            introHeading.style.display = "none";
        }

        // Add user message to UI
        const userRow = document.createElement("div");
        userRow.className = "message-row user-message-row";
        userRow.innerHTML = `
            <div class="message-bubble user-bubble">
                ${escapeHtml(text)}
            </div>
        `;
        chatMessages.appendChild(userRow);
        userInput.value = "";
        scrollToBottom();

        // Add loading bot message
        const botRow = document.createElement("div");
        botRow.className = "message-row bot-message-row";
        const botBubbleId = "bot-bubble-" + Date.now();
        botRow.innerHTML = `
            <div class="bot-avatar">
                <i class="bi bi-stars"></i>
            </div>
            <div class="message-bubble bot-bubble" id="${botBubbleId}">
                <span class="thinking-dots">Thinking...</span>
            </div>
        `;
        chatMessages.appendChild(botRow);
        scrollToBottom();

        try {
            const response = await fetch("/get_response", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question: text })
            });

            const data = await response.json();
            const botBubble = document.getElementById(botBubbleId);

            if (response.ok && data.response) {
                botBubble.innerHTML = formatMarkdown(data.response);
            } else {
                botBubble.innerHTML = `<span class="error-text">Error: ${escapeHtml(data.error || "Failed to get response.")}</span>`;
            }
        } catch (err) {
            const botBubble = document.getElementById(botBubbleId);
            if (botBubble) {
                botBubble.innerHTML = `<span class="error-text">Error: Unable to connect to server.</span>`;
            }
        }
        scrollToBottom();
    }

    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleSendMessage();
    });

    userInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatMarkdown(text) {
        // Simple formatter for newline & backticks
        let formatted = escapeHtml(text);
        formatted = formatted.replace(/\n/g, "<br>");
        formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
        return formatted;
    }
});
