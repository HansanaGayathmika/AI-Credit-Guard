console.log("AI Credit Guard is watching! 👀");

// ── Token estimator ──────────────────────────────────────
function estimateTokens(text) {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.ceil((words * 1.3) + (chars / 6));
}

// ── Create the floating counter bar ──────────────────────
function createBar() {
  const bar = document.createElement("div");
  bar.id = "acg-bar";
  bar.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999999;
    background: rgba(15,15,20,0.92);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 40px;
    padding: 8px 20px;
    font-family: sans-serif;
    font-size: 13px;
    color: white;
    display: flex;
    gap: 12px;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  `;
  bar.innerHTML = `
    <span>🛡 AI Credit Guard</span>
    <span id="acg-tokens" style="color:#a5b4fc;font-weight:700">0 tokens</span>
    <span id="acg-cost" style="color:#86efac">~$0.0000</span>
  `;
  document.body.appendChild(bar);
}

// ── Update the bar with latest counts ────────────────────
function updateBar(text) {
  const tokens = estimateTokens(text);
  const cost = (tokens / 1_000_000) * 3.0; // Claude Sonnet price

  document.getElementById("acg-tokens").textContent = tokens + " tokens";
  document.getElementById("acg-cost").textContent = "~$" + cost.toFixed(4);
}

// ── Wait for textarea ─────────────────────────────────────
function waitForTextarea() {
  const textarea = document.querySelector('[data-testid="chat-input"]');

  if (textarea) {
    console.log("Found the textarea! ✅");
    createBar();

    textarea.addEventListener("input", function () {
      const text = textarea.innerText;
      updateBar(text);
    });

  } else {
    setTimeout(waitForTextarea, 500);
  }
}

waitForTextarea();