/**
 * Validates Mermaid syntax
 */
export function validateMermaid(code: string): { valid: boolean; error?: string } {
  try {
    // Basic validation checks
    const trimmed = code.trim();

    if (!trimmed) {
      return { valid: false, error: 'Empty input' };
    }

    // Check for diagram type declaration
    const diagramTypes = [
      'sequenceDiagram',
      'graph',
      'flowchart',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'gantt',
      'pie',
      'journey',
    ];

    const hasValidType = diagramTypes.some((type) => trimmed.startsWith(type));

    if (!hasValidType) {
      return {
        valid: false,
        error: 'Missing or invalid diagram type declaration',
      };
    }

    // Check for basic syntax errors
    const lines = trimmed.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('%%')) {
        // Skip comments
        // Check for unmatched brackets/parentheses
        const openBrackets = (line.match(/\[/g) || []).length;
        const closeBrackets = (line.match(/\]/g) || []).length;
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;

        if (openBrackets !== closeBrackets) {
          return {
            valid: false,
            error: `Unmatched brackets on line ${i + 1}`,
          };
        }

        if (openParens !== closeParens) {
          return {
            valid: false,
            error: `Unmatched parentheses on line ${i + 1}`,
          };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Prettifies/formats Mermaid code
 */
export function prettifyMermaid(code: string): string {
  try {
    const lines = code.split('\n');
    const formatted: string[] = [];
    const indentSize = 4;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('%%')) {
        formatted.push(trimmed);
        continue;
      }

      // Check for diagram type (no indent)
      if (
        trimmed.startsWith('sequenceDiagram') ||
        trimmed.startsWith('graph') ||
        trimmed.startsWith('flowchart') ||
        trimmed.startsWith('classDiagram')
      ) {
        formatted.push(trimmed);
        continue;
      }

      // Check for keywords that should be indented
      if (
        trimmed.startsWith('participant') ||
        trimmed.startsWith('actor') ||
        trimmed.includes('->') ||
        trimmed.includes('->>') ||
        trimmed.includes('-->')
      ) {
        const indent = ' '.repeat(indentSize);
        formatted.push(indent + trimmed);
        continue;
      }

      // Default: add with current indent
      formatted.push(trimmed);
    }

    // Add spacing after diagram type
    if (formatted.length > 1 && formatted[0].includes('Diagram')) {
      return formatted[0] + '\n' + formatted.slice(1).join('\n');
    }

    return formatted.join('\n');
  } catch (error) {
    console.error('Prettify error:', error);
    return code; // Return original on error
  }
}

/**
 * Beautifies Mermaid sequence diagram with consistent spacing
 */
export function beautifySequenceDiagram(code: string): string {
  try {
    const lines = code.split('\n');
    const formatted: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Keep diagram declaration
      if (trimmed.startsWith('sequenceDiagram')) {
        formatted.push(trimmed);
        formatted.push(''); // Add blank line after
        continue;
      }

      // Format participant declarations
      if (trimmed.startsWith('participant') || trimmed.startsWith('actor')) {
        formatted.push('    ' + trimmed);
        continue;
      }

      // Format interactions with consistent spacing
      if (trimmed.includes('->') || trimmed.includes('->>') || trimmed.includes('-->')) {
        // Normalize arrow spacing
        let normalized = trimmed
          .replace(/\s*->>\s*/g, '->>')
          .replace(/\s*->\s*/g, '->')
          .replace(/\s*-->\s*/g, '-->');

        // Add spaces around arrows for readability
        normalized = normalized
          .replace(/->>/g, ' ->> ')
          .replace(/->/g, ' -> ')
          .replace(/-->/g, ' --> ')
          .replace(/\s+/g, ' ') // Remove extra spaces
          .trim();

        formatted.push('    ' + normalized);
        continue;
      }

      // Format notes, loops, alt blocks with indentation
      if (
        trimmed.startsWith('Note') ||
        trimmed.startsWith('loop') ||
        trimmed.startsWith('alt') ||
        trimmed.startsWith('opt') ||
        trimmed.startsWith('par')
      ) {
        formatted.push('    ' + trimmed);
        continue;
      }

      if (trimmed === 'end') {
        formatted.push('    ' + trimmed);
        continue;
      }

      // Default: indent other content
      formatted.push('    ' + trimmed);
    }

    // Add blank line after participant declarations
    const result: string[] = [];
    let inParticipants = false;

    for (let i = 0; i < formatted.length; i++) {
      const line = formatted[i];
      result.push(line);

      if (line.trim().startsWith('participant') || line.trim().startsWith('actor')) {
        inParticipants = true;
      } else if (
        inParticipants &&
        line.trim() &&
        !line.trim().startsWith('participant') &&
        !line.trim().startsWith('actor')
      ) {
        // Add blank line after last participant
        if (i > 0 && result[result.length - 2].trim().startsWith('participant')) {
          result.splice(result.length - 1, 0, '');
        }
        inParticipants = false;
      }
    }

    return result.join('\n');
  } catch (error) {
    console.error('Beautify error:', error);
    return code;
  }
}
