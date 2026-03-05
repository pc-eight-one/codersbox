import { visit } from 'unist-util-visit';
import { createHash } from 'crypto';

/**
 * Encode PlantUML text for URL using the PlantUML web service encoding
 * This is a simplified version - PlantUML uses a custom deflate + encode
 */
function encodePlantUML(text) {
  // Simple encoding for the web service
  // In production, you might want to use proper deflate encoding
  const compressed = Buffer.from(text).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return compressed;
}

/**
 * Remark plugin to transform PlantUML code blocks into images
 * Uses PlantUML web service (plantuml.com) to generate diagrams
 */
export default function remarkPlantuml(options = {}) {
  const baseUrl = options.baseUrl || 'https://www.plantuml.com/plantuml';
  const format = options.format || 'svg';
  
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'plantuml') return;
      
      // Extract the PlantUML code (remove @startuml/@enduml if present)
      let code = node.value;
      
      // Generate the image URL using PlantUML web service
      // Note: This uses the simple encoding. For production, consider using
      // the proper PlantUML encoding or a local PlantUML server
      const encoded = encodePlantUML(code);
      const imageUrl = `${baseUrl}/${format}/~h${encoded}`;
      
      // Replace the code block with an image node
      parent.children[index] = {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url: imageUrl,
            alt: 'PlantUML Diagram',
            title: null,
          },
        ],
      };
    });
  };
}
