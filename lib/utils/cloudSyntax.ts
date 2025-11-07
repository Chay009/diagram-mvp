/**
 * Cloud Architecture Diagram Syntax
 *
 * Simple custom syntax for defining cloud architecture diagrams
 * that compiles to Graphviz DOT format.
 *
 * SYNTAX:
 *
 * 1. Nodes (Services/Resources):
 *    node_id: provider-service [label]
 *
 *    Examples:
 *    web: aws-ec2 "Web Server"
 *    db: aws-rds "Database"
 *    api: gcp-cloud-run "API Service"
 *
 * 2. Connections:
 *    from -> to [label]
 *
 *    Examples:
 *    web -> api "HTTPS"
 *    api -> db "Query"
 *
 * 3. Groups (VPC/Subnets/Clusters):
 *    group name {
 *      ...nodes and connections
 *    }
 *
 *    Examples:
 *    group "VPC" {
 *      web: aws-ec2 "Web"
 *      api: aws-lambda "API"
 *    }
 *
 * 4. Provider shortcuts:
 *    AWS: aws-ec2, aws-s3, aws-lambda, aws-rds, aws-elb, aws-cloudfront
 *    GCP: gcp-compute, gcp-storage, gcp-cloud-run, gcp-cloud-sql
 *    Azure: azure-vm, azure-storage, azure-functions, azure-sql
 */

export interface CloudNode {
  id: string;
  provider: string;
  service: string;
  label?: string;
  group?: string;
}

export interface CloudConnection {
  from: string;
  to: string;
  label?: string;
}

export interface CloudGroup {
  name: string;
  nodes: CloudNode[];
}

export interface CloudDiagram {
  nodes: CloudNode[];
  connections: CloudConnection[];
  groups: CloudGroup[];
}

/**
 * Provider icon mappings
 */
export const CLOUD_ICONS: Record<string, string> = {
  // AWS
  'aws-ec2': 'EC2',
  'aws-s3': 'S3',
  'aws-lambda': 'λ',
  'aws-rds': 'RDS',
  'aws-elb': 'ELB',
  'aws-cloudfront': 'CF',
  'aws-dynamodb': 'DynamoDB',
  'aws-sqs': 'SQS',
  'aws-sns': 'SNS',
  'aws-api-gateway': 'API GW',

  // GCP
  'gcp-compute': 'Compute',
  'gcp-storage': 'Storage',
  'gcp-cloud-run': 'Cloud Run',
  'gcp-cloud-sql': 'Cloud SQL',
  'gcp-cloud-functions': 'Functions',
  'gcp-gke': 'GKE',
  'gcp-pubsub': 'Pub/Sub',
  'gcp-bigquery': 'BigQuery',

  // Azure
  'azure-vm': 'VM',
  'azure-storage': 'Storage',
  'azure-functions': 'Functions',
  'azure-sql': 'SQL',
  'azure-cosmos': 'Cosmos',
  'azure-aks': 'AKS',
  'azure-service-bus': 'Service Bus',
};

/**
 * Provider colors
 */
export const PROVIDER_COLORS: Record<string, string> = {
  aws: '#FF9900',
  gcp: '#4285F4',
  azure: '#0078D4',
  default: '#6B7280',
};

/**
 * Parse cloud architecture syntax
 */
export function parseCloudSyntax(input: string): CloudDiagram {
  const nodes: CloudNode[] = [];
  const connections: CloudConnection[] = [];
  const groups: CloudGroup[] = [];

  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('//'));

  let currentGroup: string | null = null;
  let groupNodes: CloudNode[] = [];
  let groupName = '';

  for (const line of lines) {
    // Group start
    if (line.includes('group') && line.includes('{')) {
      const match = line.match(/group\s+"?([^"{]+)"?\s*{/);
      if (match) {
        groupName = match[1].trim();
        currentGroup = groupName;
        groupNodes = [];
      }
      continue;
    }

    // Group end
    if (line === '}' && currentGroup) {
      groups.push({
        name: groupName,
        nodes: groupNodes,
      });
      currentGroup = null;
      groupNodes = [];
      continue;
    }

    // Node definition: id: provider-service "label"
    const nodeMatch = line.match(/^(\w+):\s*([\w-]+)(?:\s+"([^"]+)")?/);
    if (nodeMatch) {
      const [, id, serviceKey, label] = nodeMatch;
      const [provider, service] = serviceKey.split('-');

      const node: CloudNode = {
        id,
        provider: provider || 'default',
        service: service || serviceKey,
        label: label || id,
        group: currentGroup || undefined,
      };

      nodes.push(node);
      if (currentGroup) {
        groupNodes.push(node);
      }
      continue;
    }

    // Connection: from -> to "label"
    const connectionMatch = line.match(/^(\w+)\s*->\s*(\w+)(?:\s+"([^"]+)")?/);
    if (connectionMatch) {
      const [, from, to, label] = connectionMatch;

      connections.push({
        from,
        to,
        label: label || '',
      });
      continue;
    }
  }

  return { nodes, connections, groups };
}

/**
 * Convert cloud syntax to Graphviz DOT format
 */
export function cloudToDot(diagram: CloudDiagram, colors: Record<string, string>): string {
  const lines: string[] = [];

  lines.push('digraph CloudArchitecture {');
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box, style="rounded,filled", fontname="Arial"];');
  lines.push('  edge [fontname="Arial", fontsize=10];');
  lines.push('');

  // Add groups as subgraphs
  for (const group of diagram.groups) {
    lines.push(`  subgraph cluster_${group.name.replace(/\s+/g, '_')} {`);
    lines.push(`    label="${group.name}";`);
    lines.push('    style=dashed;');
    lines.push(`    color="${colors.border}";`);
    lines.push('');

    for (const node of group.nodes) {
      const color = PROVIDER_COLORS[node.provider] || PROVIDER_COLORS.default;
      const icon = CLOUD_ICONS[`${node.provider}-${node.service}`] || node.service;
      const label = `${icon}\\n${node.label}`;

      lines.push(
        `    ${node.id} [label="${label}", fillcolor="${color}30", color="${color}"];`
      );
    }

    lines.push('  }');
    lines.push('');
  }

  // Add ungrouped nodes
  for (const node of diagram.nodes) {
    if (node.group) continue; // Skip grouped nodes

    const color = PROVIDER_COLORS[node.provider] || PROVIDER_COLORS.default;
    const icon = CLOUD_ICONS[`${node.provider}-${node.service}`] || node.service;
    const label = `${icon}\\n${node.label}`;

    lines.push(
      `  ${node.id} [label="${label}", fillcolor="${color}30", color="${color}"];`
    );
  }

  lines.push('');

  // Add connections
  for (const conn of diagram.connections) {
    const label = conn.label ? ` [label="${conn.label}"]` : '';
    lines.push(`  ${conn.from} -> ${conn.to}${label};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Get example cloud syntax
 */
export function getCloudSyntaxExample(): string {
  return `# AWS Architecture Example
group "VPC" {
  web: aws-ec2 "Web Server"
  api: aws-lambda "API"
  db: aws-rds "Database"
}

cdn: aws-cloudfront "CDN"
storage: aws-s3 "Static Assets"

# Connections
cdn -> web "Route"
web -> api "HTTP"
api -> db "Query"
api -> storage "Store"`;
}
