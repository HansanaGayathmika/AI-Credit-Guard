console.log("AI Credit Guard is watching! 👀");

function estimateTokens(text) {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.ceil((words * 1.3) + (chars / 6));
}

function createBar() {
  // Don't create twice
  if (document.getElementById("acg-bar")) return;

  const bar = document.createElement("div");
  bar.id = "acg-bar";
  bar.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    z-index: 999999;
    background: rgba(15,15,20,0.95);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 40px;
    padding: 10px 24px;
    font-family: sans-serif;
    font-size: 13px;
    color: white;
    display: flex;
    gap: 14px;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  `;
 bar.innerHTML = `
    <span>🛡</span>
    <span id="acg-tokens" style="color:#a5b4fc;font-weight:700">0 tokens</span>
    <span id="acg-cost" style="color:#86efac">~$0.0000</span>
    <span id="acg-badge" style="font-size:12px">✓ Good</span>
    <button id="acg-btn" style="
      display:none;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:white;
      border:none;
      border-radius:20px;
      padding:4px 12px;
      font-size:12px;
      font-weight:700;
      cursor:pointer;
    ">⚡ Optimize</button>
  `;
  document.body.appendChild(bar);
  document.getElementById("acg-btn").addEventListener("click", function() {
  const textarea = document.querySelector('[data-testid="chat-input"]');
  const text = textarea.innerText;
  optimizePrompt(text);
});
}

function updateBar(text) {
  const tokens = estimateTokens(text);
  const cost = (tokens / 1_000_000) * 3.0;
  const score = qualityScore(text);

  document.getElementById("acg-tokens").textContent = tokens + " tokens";
  document.getElementById("acg-cost").textContent = "~$" + cost.toFixed(4);

  const badge = document.getElementById("acg-badge");
  const btn = document.getElementById("acg-btn");

  if (score === "good") {
    badge.textContent = "✓ Good";
    badge.style.color = "#4ade80";
    btn.style.display = "none";
  } else if (score === "warn") {
    badge.textContent = "⚠ Long";
    badge.style.color = "#fbbf24";
    btn.style.display = "inline-block";
  } else {
    badge.textContent = "✗ Weak";
    badge.style.color = "#f87171";
    btn.style.display = "inline-block";
  }
}
function optimizePrompt(text) {
  const textarea = document.querySelector('[data-testid="chat-input"]');
  const btn = document.getElementById("acg-btn");

  btn.textContent = "⏳ Working...";
  btn.disabled = true;

  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_API_KEY_HERE",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: "Rewrite the user's prompt to be concise and clear. Remove filler words. Return ONLY the rewritten prompt, nothing else.",
      messages: [{ role: "user", content: text }]
    })
  })
  .then(res => res.json())
  .then(data => {
    const optimized = data.content[0].text;

    // Replace the text in the chat box
    textarea.innerText = optimized;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    btn.textContent = "⚡ Optimize";
    btn.disabled = false;
  })
  .catch(err => {
    console.log("Error:", err);
    btn.textContent = "⚡ Optimize";
    btn.disabled = false;
  });
}

function waitForTextarea() {
  const textarea = document.querySelector('[data-testid="chat-input"]');

  if (textarea) {
    console.log("Found the textarea! ✅");
    createBar(); // 👈 create bar immediately when textarea found

    textarea.addEventListener("input", function () {
      const text = textarea.innerText;
      updateBar(text);
    });

  } else {
    setTimeout(waitForTextarea, 500);
  }
}

function qualityScore(text) {
  if (!text || text.length < 10) return "good";

  const fillerWords = (text.match(/\b(please|kindly|very|really|just|basically|actually|literally)\b/gi) || []).length;
  const wordCount = text.trim().split(/\s+/).length;

  if (fillerWords > 2) return "bad";
  if (wordCount > 60) return "warn";
  return "good";
}

// Also try creating the bar after page fully loads
window.addEventListener("load", () => {
  setTimeout(waitForTextarea, 1000);
});

waitForTextarea();