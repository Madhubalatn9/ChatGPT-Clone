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

   
    const plusBtn = document.getElementById("plus-btn");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const imageUpload = document.getElementById("image-upload");
    const fileUpload = document.getElementById("file-upload");
    const addImageOption = document.getElementById("add-image-option");
    const addFileOption = document.getElementById("add-file-option");

    
    const attachmentPreview = document.getElementById("attachment-preview");
    const previewImg = document.getElementById("preview-img");
    const fileIconBadge = document.getElementById("file-icon-badge");
    const previewFilename = document.getElementById("preview-filename");
    const removeAttachmentBtn = document.getElementById("remove-attachment-btn");

    let currentAttachment = null;

    if (plusBtn && dropdownMenu) {
        plusBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
            plusBtn.classList.toggle("active");
        });

        document.addEventListener("click", function (e) {
            if (!dropdownMenu.contains(e.target) && !plusBtn.contains(e.target)) {
                dropdownMenu.classList.remove("show");
                plusBtn.classList.remove("active");
            }
        });

        if (addImageOption && imageUpload) {
            addImageOption.addEventListener("click", function () {
                dropdownMenu.classList.remove("show");
                plusBtn.classList.remove("active");
                imageUpload.click();
            });
        }

        if (addFileOption && fileUpload) {
            addFileOption.addEventListener("click", function () {
                dropdownMenu.classList.remove("show");
                plusBtn.classList.remove("active");
                fileUpload.click();
            });
        }
    }

  
    function handleFileSelected(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            currentAttachment = {
                name: file.name,
                type: file.type,
                base64: e.target.result
            };

            if (attachmentPreview) {
                attachmentPreview.style.display = "flex";
                if (file.type.startsWith("image/")) {
                    if (previewImg) {
                        previewImg.src = e.target.result;
                        previewImg.style.display = "block";
                    }
                    if (fileIconBadge) fileIconBadge.style.display = "none";
                    if (previewFilename) previewFilename.textContent = "";
                } else {
                    if (previewImg) previewImg.style.display = "none";
                    if (fileIconBadge) fileIconBadge.style.display = "flex";
                    if (previewFilename) previewFilename.textContent = file.name;
                }
            }
        };
        reader.readAsDataURL(file);
    }

    if (imageUpload) {
        imageUpload.addEventListener("change", function (e) {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });
    }

    if (fileUpload) {
        fileUpload.addEventListener("change", function (e) {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });
    }

    function clearAttachment() {
        currentAttachment = null;
        if (attachmentPreview) attachmentPreview.style.display = "none";
        if (previewImg) previewImg.src = "";
        if (previewFilename) previewFilename.textContent = "";
        if (imageUpload) imageUpload.value = "";
        if (fileUpload) fileUpload.value = "";
    }

    if (removeAttachmentBtn) {
        removeAttachmentBtn.addEventListener("click", clearAttachment);
    }

    if (!chatForm || !userInput || !chatMessages) return;

    function scrollToBottom() {
        const homePage = document.querySelector(".home-page");
        if (homePage) {
            homePage.scrollTop = homePage.scrollHeight;
        }
    }

    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text && !currentAttachment) return;

        const attachmentToSend = currentAttachment;

       
        if (introHeading) {
            introHeading.style.display = "none";
        }

        
        const userRow = document.createElement("div");
        userRow.className = "message-row user-message-row";

        let bubbleContent = "";
        if (attachmentToSend) {
            if (attachmentToSend.type.startsWith("image/")) {
                bubbleContent += `<img src="${attachmentToSend.base64}" alt="Uploaded image" class="user-attachment-img" />`;
            } else {
                bubbleContent += `<div class="user-attachment-file"><i class="bi bi-file-earmark-text"></i> ${escapeHtml(attachmentToSend.name)}</div>`;
            }
        }
        if (text) {
            bubbleContent += `<div>${escapeHtml(text)}</div>`;
        }

        userRow.innerHTML = `
            <div class="message-bubble user-bubble">
                ${bubbleContent}
            </div>
        `;
        chatMessages.appendChild(userRow);
        userInput.value = "";
        clearAttachment();
        scrollToBottom();

        
        const botRow = document.createElement("div");
        botRow.className = "message-row bot-message-row";
        const botBubbleId = "bot-bubble-" + Date.now();
        botRow.innerHTML = `
            <div class="bot-avatar"></div>
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
                body: JSON.stringify({
                    question: text,
                    attachment: attachmentToSend
                })
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

   
    let html = marked.parse(text);

    
    html = DOMPurify.sanitize(html);

   
    const container = document.createElement("div");
    container.innerHTML = html;

   
    container.querySelectorAll("pre code").forEach((codeBlock) => {

        const className = codeBlock.className || "";
        const match = className.match(/language-(\w+)/);

        const language = match ? match[1] : "";

        if (language && hljs.getLanguage(language)) {
            codeBlock.innerHTML = hljs.highlight(
                codeBlock.textContent,
                {
                    language: language
                }
            ).value;
        } else {
            
            codeBlock.innerHTML = hljs.highlightAuto(
                codeBlock.textContent
            ).value;
        }

       
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
