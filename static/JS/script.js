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
                botBubble.innerHTML = "";
                const rawText = data.response;
                var i = 0;
                var speed = 10;

                function typeWriter() {
                    if (i < rawText.length) {
                        botBubble.textContent += rawText.charAt(i);
                        i++;
                        setTimeout(typeWriter, speed);
                    } else {
                        botBubble.innerHTML = formatMarkdown(rawText);
                    }
                }
                typeWriter();
            } else {
                botBubble.innerHTML = `<span class="error-text">Error: ${escapeHtml(data.error || "Failed to get response.")}</span>`;
            }
        } catch (err) {
            console.error("Fetch/Processing Error:", err);
            const botBubble = document.getElementById(botBubbleId);
            if (botBubble) {
                const errorMsg = err instanceof TypeError && err.message.includes("fetch") 
                    ? "Unable to connect to server." 
                    : (err.message || "An unexpected error occurred.");
                botBubble.innerHTML = `<span class="error-text">Error: ${escapeHtml(errorMsg)}</span>`;
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

    // function formatMarkdown(text) {
    //     // Simple formatter for newline & backticks
    //     let formatted = escapeHtml(text);
    //     formatted = formatted.replace(/\n/g, "<br>");
    //     formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
    //     return formatted;
    // }
    function formatMarkdown(text) {
    if (!text) return "";

    // Convert Markdown to HTML
    let html = marked.parse(text);

    // Sanitize generated HTML
    html = DOMPurify.sanitize(html);

    // Create temporary container
    const container = document.createElement("div");
    container.innerHTML = html;

    // Find all code blocks
    container.querySelectorAll("pre code").forEach((codeBlock) => {

        // Detect language
        const className = codeBlock.className || "";
        const match = className.match(/language-(\w+)/);

        const language = match ? match[1] : "";

        // Apply syntax highlighting
        if (language && hljs.getLanguage(language)) {
            codeBlock.innerHTML = hljs.highlight(
                codeBlock.textContent,
                {
                    language: language
                }
            ).value;
        } else {
            // Auto detect language if no language is specified
            codeBlock.innerHTML = hljs.highlightAuto(
                codeBlock.textContent
            ).value;
        }

        // Create copy button
        const copyButton = document.createElement("button");

        copyButton.className = "copy-code-btn";
        copyButton.textContent = "Copy";

        copyButton.addEventListener("click", async () => {

            const code = codeBlock.textContent;

            try {
                await navigator.clipboard.writeText(code);

                copyButton.textContent = "Copied!";

                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1500);

            } catch (error) {
                console.error("Copy failed:", error);
            }
        });

        // Put code and button inside wrapper
        const wrapper = document.createElement("div");

        wrapper.className = "code-block-wrapper";

        const header = document.createElement("div");

        header.className = "code-block-header";

        if (language) {
            const languageLabel = document.createElement("span");

            languageLabel.textContent = language;

            header.appendChild(languageLabel);
        }

        header.appendChild(copyButton);

        wrapper.appendChild(header);

        const pre = codeBlock.parentElement;

        pre.parentElement.replaceChild(wrapper, pre);

        wrapper.appendChild(pre);
    });

    return container.innerHTML;
}
});

const response = `
# Hello!

Here is some Java code:

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
\`\`\`

This is **bold text**.

This is \`inline code\`.
`;

const formatted = formatMarkdown(response);

document.getElementById("chat-container").innerHTML += `
    <div class="message assistant-message">
        ${formatted}
    </div>
`;
