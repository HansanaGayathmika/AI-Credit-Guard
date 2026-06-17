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
  console.log("Bar created! ✅");
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