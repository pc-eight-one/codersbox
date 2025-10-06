// Client-side mermaid diagram renderer
async function initializeMermaid() {
  try {
    // Dynamically import mermaid from CDN
    const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');

    // Initialize mermaid with configuration
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false
      }
    });

    return mermaid.default;
  } catch (error) {
    console.error('Failed to load mermaid:', error);
    return null;
  }
}

// Function to render mermaid diagrams
async function renderMermaidDiagrams() {
  const mermaid = await initializeMermaid();
  if (!mermaid) return;

  // Find all code blocks with language-mermaid
  const codeBlocks = document.querySelectorAll('pre code.language-mermaid');

  for (let i = 0; i < codeBlocks.length; i++) {
    const codeBlock = codeBlocks[i];
    const diagram = codeBlock.textContent || codeBlock.innerText;
    const preElement = codeBlock.closest('pre');

    // Skip if already processed
    if (preElement && preElement.dataset.mermaidProcessed === 'true') {
      continue;
    }

    if (diagram && diagram.trim()) {
      try {
        const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, diagram.trim());

        // Create a container div
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.cssText = 'display: flex; justify-content: center; align-items: center; margin: 2rem 0; text-align: center;';
        container.innerHTML = svg;

        // Replace the pre element with our container
        if (preElement && preElement.parentNode) {
          preElement.parentNode.replaceChild(container, preElement);
          container.setAttribute('data-mermaid-processed', 'true');
        }

      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // Show error in place of diagram
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: #dc2626; padding: 1rem; border: 1px solid #fca5a5; border-radius: 0.375rem; background-color: #fef2f2; margin: 2rem 0;';
        errorDiv.textContent = `Error rendering diagram: ${error.message}`;

        if (preElement && preElement.parentNode) {
          preElement.parentNode.replaceChild(errorDiv, preElement);
        }
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
} else {
  renderMermaidDiagrams();
}

// Re-render on page navigation (for SPAs)
document.addEventListener('astro:page-load', renderMermaidDiagrams);
