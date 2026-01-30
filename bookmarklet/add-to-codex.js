// Claude Codex - Add Pattern bookmarklet
// Select text on any webpage, click this bookmarklet, and add it to your Codex

javascript:(async () => {
  // Get selected text
  const selection = window.getSelection().toString().trim();

  if (!selection) {
    alert('❌ Please select some text first!');
    return;
  }

  // Show form
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:999998;display:flex;align-items:center;justify-content:center;font-family:system-ui;';

  const form = document.createElement('div');
  form.style.cssText = 'background:white;border-radius:12px;padding:32px;max-width:500px;width:90%;box-shadow:0 20px 25px rgba(0,0,0,0.3);';

  form.innerHTML = `
    <h2 style="margin:0 0 20px;color:#1f2937;font-size:24px;">Add to Claude Codex</h2>
    <div style="margin-bottom:16px;">
      <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;">Pattern Name</label>
      <input type="text" id="codex-name" placeholder="e.g. React useDebounce hook" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;">Category</label>
      <select id="codex-category" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">
        <option value="skills/learned">Skill (Learned Pattern)</option>
        <option value="commands">Command</option>
        <option value="agents">Agent</option>
        <option value="rules">Rule</option>
      </select>
    </div>
    <div style="margin-bottom:20px;">
      <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;">Description</label>
      <textarea id="codex-desc" placeholder="What does this pattern do?" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;min-height:80px;"></textarea>
    </div>
    <div style="margin-bottom:20px;padding:12px;background:#f3f4f6;border-radius:6px;max-height:200px;overflow-y:auto;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px;font-weight:600;">Selected Content:</div>
      <pre style="margin:0;font-size:12px;color:#1f2937;white-space:pre-wrap;word-wrap:break-word;">${selection.substring(0, 500)}${selection.length > 500 ? '...' : ''}</pre>
    </div>
    <div style="display:flex;gap:12px;">
      <button id="codex-submit" style="flex:1;padding:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Add to Codex</button>
      <button id="codex-cancel" style="padding:12px 20px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancel</button>
    </div>
  `;

  overlay.appendChild(form);
  document.body.appendChild(overlay);

  // Cancel button
  document.getElementById('codex-cancel').onclick = () => overlay.remove();

  // Submit button
  document.getElementById('codex-submit').onclick = async () => {
    const name = document.getElementById('codex-name').value.trim();
    const category = document.getElementById('codex-category').value;
    const description = document.getElementById('codex-desc').value.trim();

    if (!name) {
      alert('Please enter a pattern name');
      return;
    }

    if (!description) {
      alert('Please enter a description');
      return;
    }

    // Create markdown content
    const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
    const content = `---
name: ${name}
description: ${description}
source: ${window.location.href}
added: ${new Date().toISOString().split('T')[0]}
---

# ${name}

${description}

## Implementation

\`\`\`
${selection}
\`\`\`

## Source

Captured from: ${window.location.href}

## Usage

[Add usage examples here]
`;

    // Copy to clipboard (since we can't create GitHub PRs directly without auth)
    await navigator.clipboard.writeText(content);

    overlay.remove();

    // Show success message
    const success = document.createElement('div');
    success.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:12px;padding:32px;max-width:500px;width:90%;box-shadow:0 20px 25px rgba(0,0,0,0.3);z-index:999999;font-family:system-ui;text-align:center;';
    success.innerHTML = `
      <div style="font-size:48px;margin-bottom:16px;">✅</div>
      <h2 style="margin:0 0 12px;color:#1f2937;font-size:20px;">Pattern Copied!</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">The pattern markdown has been copied to your clipboard.</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:6px;margin-bottom:20px;text-align:left;font-size:13px;color:#374151;">
        <strong>Next steps:</strong><br><br>
        1. Go to your local <code>~/.claude/${category}/</code><br>
        2. Create file: <code>${filename}</code><br>
        3. Paste the content<br>
        4. The auto-sync will commit and push automatically
      </div>
      <button onclick="this.parentElement.remove()" style="padding:12px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Got it!</button>
    `;
    document.body.appendChild(success);
  };
})();
