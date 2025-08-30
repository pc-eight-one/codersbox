// Client-side mermaid diagram renderer
async function initializeMermaid() {
  try {
    // Dynamically import mermaid
    const mermaid = await import('mermaid');
    
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

  console.log('Looking for mermaid diagrams...');

  // Try multiple selectors to find mermaid code blocks
  const selectors = [
    'pre code.language-mermaid',
    'pre code.language-mermaid ~ code', // some highlighters clone code blocks
    'pre[class*="language-mermaid"]',
    'code.language-mermaid',
    'pre:has(code.language-mermaid)',
    'pre code[class*="mermaid"]',
    'pre code.language-mermaid, pre code[class*="language-mermaid"], pre:has(code.language-mermaid)'
  ];
  
  // Collect potential code blocks across selectors
  const codeSet = new Set();
  for (const selector of selectors) {
    try {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        console.log(`Found ${found.length} elements with selector: ${selector}`);
        found.forEach(el => codeSet.add(el));
      }
    } catch (e) {
      // Some selectors might not be supported in all browsers
      continue;
    }
  }

  // Also look for any pre element containing typical mermaid keywords
  const allPres = document.querySelectorAll('pre');
  if (allPres.length) {
    console.log(`Checking ${allPres.length} pre elements for mermaid content...`);
    allPres.forEach(pre => {
      if (pre.dataset.mermaidProcessed === 'true') return;
      const text = pre.textContent || pre.innerText;
      if (text && (
        /^(\s*%%.*\n)*\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|gitGraph|erDiagram)/i.test(text)
      )) {
        console.log('Found potential mermaid diagram in <pre>');
        codeSet.add(pre.querySelector('code') || pre);
      }
    });
  }
  
  const codeBlocks = Array.from(codeSet);
  console.log(`Processing ${codeBlocks.length} mermaid diagrams...`);
  
  for (let i = 0; i < codeBlocks.length; i++) {
    const element = codeBlocks[i];
    let diagram = element.textContent || element.innerText;
    
    // If it's a code element inside pre, get the parent pre
    let targetElement = element;
    if (element.tagName && element.tagName.toLowerCase() === 'code') {
      const preParent = element.closest('pre');
      if (preParent) {
        targetElement = preParent;
        diagram = element.textContent || element.innerText;
      }
    }
    
    // Skip if already processed
    if (targetElement && targetElement.dataset && targetElement.dataset.mermaidProcessed === 'true') {
      continue;
    }

    const preview = (diagram || '').trim().split('\n')[0]?.slice(0, 80) || '';
    console.log(`Rendering diagram ${i + 1}:`, preview);
    
    if (diagram && diagram.trim()) {
      try {
        const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, diagram.trim());
        
        // Create a container div
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.cssText = 'display: flex; justify-content: center; align-items: center; margin: 2rem 0; text-align: center;';
        container.innerHTML = svg;
        
        // Replace the target element with our container
        if (targetElement.parentNode) {
          targetElement.parentNode.replaceChild(container, targetElement);
          if (container && container.firstElementChild) {
            // Mark as processed to avoid double rendering
            container.setAttribute('data-mermaid-processed', 'true');
          }
          console.log(`Successfully rendered diagram ${i + 1}`);
        }
        
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // Show error in place of diagram
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: #dc2626; padding: 1rem; border: 1px solid #fca5a5; border-radius: 0.375rem; background-color: #fef2f2; margin: 2rem 0;';
        errorDiv.textContent = `Error rendering diagram: ${error.message}`;
        
        if (targetElement.parentNode) {
          targetElement.parentNode.replaceChild(errorDiv, targetElement);
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