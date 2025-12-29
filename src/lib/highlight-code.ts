import { codeToHtml } from 'shiki';

/**
 * Process HTML content and add syntax highlighting to code blocks
 * This is used for CMS content that contains <pre><code> blocks
 */
export async function highlightCodeBlocks(html: string): Promise<string> {
  // Match all <pre><code>...</code></pre> blocks
  const codeBlockRegex = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;

  let result = html;
  const matches = [...html.matchAll(codeBlockRegex)];

  for (const match of matches) {
    const [fullMatch, language, code] = match;
    const lang = language || 'text';

    // Decode HTML entities in the code
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    try {
      // Generate highlighted HTML using Shiki
      const highlighted = await codeToHtml(decodedCode, {
        lang,
        theme: 'github-dark',
      });

      result = result.replace(fullMatch, highlighted);
    } catch (error) {
      console.warn(`Failed to highlight code block with language "${lang}":`, error);
      // Keep original if highlighting fails
    }
  }

  return result;
}
