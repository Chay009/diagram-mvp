/**
 * Beautification utilities for cloud architecture diagrams
 */

/**
 * Beautify cloud syntax with proper indentation and spacing
 */
export function beautifyCloudSyntax(input: string): string {
  const lines = input.split('\n');
  const beautified: string[] = [];
  let inGroup = false;
  let groupIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      beautified.push('');
      continue;
    }

    // Keep comments as-is
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      beautified.push(trimmed);
      continue;
    }

    // Group start
    if (trimmed.includes('group') && trimmed.includes('{')) {
      inGroup = true;
      groupIndent = 2;

      // Ensure proper group format
      const match = trimmed.match(/group\s+"?([^"{]+)"?\s*{/);
      if (match) {
        const groupName = match[1].trim();
        beautified.push(`group "${groupName}" {`);
      } else {
        beautified.push(trimmed);
      }
      continue;
    }

    // Group end
    if (trimmed === '}') {
      inGroup = false;
      groupIndent = 0;
      beautified.push('}');
      beautified.push(''); // Add blank line after group
      continue;
    }

    // Node definition: id: provider-service "label"
    const nodeMatch = trimmed.match(/^(\w+):\s*([\w-]+)(?:\s+"([^"]+)")?/);
    if (nodeMatch) {
      const [, id, service, label] = nodeMatch;
      const indent = ' '.repeat(inGroup ? groupIndent : 0);

      if (label) {
        beautified.push(`${indent}${id}: ${service} "${label}"`);
      } else {
        beautified.push(`${indent}${id}: ${service}`);
      }
      continue;
    }

    // Connection: from -> to "label"
    const connectionMatch = trimmed.match(/^(\w+)\s*->\s*(\w+)(?:\s+"([^"]+)")?/);
    if (connectionMatch) {
      const [, from, to, label] = connectionMatch;
      const indent = ' '.repeat(inGroup ? groupIndent : 0);

      if (label) {
        beautified.push(`${indent}${from} -> ${to} "${label}"`);
      } else {
        beautified.push(`${indent}${from} -> ${to}`);
      }
      continue;
    }

    // Default: keep as-is with appropriate indent
    const indent = ' '.repeat(inGroup ? groupIndent : 0);
    beautified.push(`${indent}${trimmed}`);
  }

  return beautified.join('\n');
}

/**
 * Sort cloud diagram elements for better organization
 */
export function organizeCloudSyntax(input: string): string {
  const lines = input.split('\n').map((l) => l.trim());

  const comments: string[] = [];
  const groups: string[] = [];
  const nodes: string[] = [];
  const connections: string[] = [];

  let inGroup = false;
  let groupLines: string[] = [];

  for (const line of lines) {
    if (!line) continue;

    // Comments
    if (line.startsWith('#') || line.startsWith('//')) {
      comments.push(line);
      continue;
    }

    // Group handling
    if (line.includes('group') && line.includes('{')) {
      inGroup = true;
      groupLines = [line];
      continue;
    }

    if (line === '}' && inGroup) {
      groupLines.push(line);
      groups.push(groupLines.join('\n'));
      groupLines = [];
      inGroup = false;
      continue;
    }

    if (inGroup) {
      groupLines.push(line);
      continue;
    }

    // Node definition
    if (line.match(/^\w+:\s*[\w-]+/)) {
      nodes.push(line);
      continue;
    }

    // Connection
    if (line.includes('->')) {
      connections.push(line);
      continue;
    }
  }

  // Assemble in organized order
  const organized: string[] = [];

  if (comments.length > 0) {
    organized.push(...comments);
    organized.push('');
  }

  if (groups.length > 0) {
    organized.push(...groups);
    organized.push('');
  }

  if (nodes.length > 0) {
    organized.push(...nodes);
    organized.push('');
  }

  if (connections.length > 0) {
    organized.push(...connections);
  }

  return organized.join('\n').trim();
}

/**
 * Validate cloud syntax
 */
export function validateCloudSyntax(input: string): { valid: boolean; error?: string } {
  try {
    const lines = input
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('//'));

    const nodeIds = new Set<string>();
    let groupDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Group handling
      if (line.includes('group') && line.includes('{')) {
        groupDepth++;
        continue;
      }

      if (line === '}') {
        groupDepth--;
        if (groupDepth < 0) {
          return { valid: false, error: `Unmatched closing brace at line ${i + 1}` };
        }
        continue;
      }

      // Node definition
      const nodeMatch = line.match(/^(\w+):\s*([\w-]+)/);
      if (nodeMatch) {
        const [, id] = nodeMatch;

        if (nodeIds.has(id)) {
          return { valid: false, error: `Duplicate node ID "${id}" at line ${i + 1}` };
        }

        nodeIds.add(id);
        continue;
      }

      // Connection
      const connectionMatch = line.match(/^(\w+)\s*->\s*(\w+)/);
      if (connectionMatch) {
        const [, from, to] = connectionMatch;

        if (!nodeIds.has(from)) {
          return {
            valid: false,
            error: `Connection references undefined node "${from}" at line ${i + 1}`,
          };
        }

        if (!nodeIds.has(to)) {
          return {
            valid: false,
            error: `Connection references undefined node "${to}" at line ${i + 1}`,
          };
        }

        continue;
      }

      // Unknown syntax
      return { valid: false, error: `Invalid syntax at line ${i + 1}: "${line}"` };
    }

    if (groupDepth !== 0) {
      return { valid: false, error: 'Unclosed group block' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}
