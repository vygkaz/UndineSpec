export function generateMermaid(spec: any): string {
  const lines: string[] = [];
  const edges: string[] = [];
  lines.push('classDiagram');
  // Add a root node so every path has a valid parent
  lines.push('class `/` {');
  lines.push('  <<Path>>');
  lines.push('}');

  const paths = spec.paths || {};
  const pathSet = new Set<string>(Object.keys(paths));
  pathSet.add('/');
  for (const [path, pathItem] of Object.entries<any>(paths)) {
    lines.push(`class \`${path}\` {`);
    lines.push('  <<Path>>');

    const queryParams = new Map<string, string>();
    if (Array.isArray((pathItem as any).parameters)) {
      for (const p of (pathItem as any).parameters) {
        if (p.in === 'query') {
          queryParams.set(p.name, schemaToString(p.schema));
        }
      }
    }

    for (const [method, op] of Object.entries<any>(pathItem)) {
      if (!isHttpMethod(method)) continue;
      if (Array.isArray(op.parameters)) {
        for (const p of op.parameters) {
          if (p.in === 'query') {
            queryParams.set(p.name, schemaToString(p.schema));
          }
        }
      }
    }

    if (queryParams.size > 0) {
      lines.push('');
      lines.push('  Query Parameters:');
      for (const [name, type] of queryParams) {
        lines.push(`    ${name}: ${type}`);
      }
    }

    lines.push('');
    lines.push('  HTTP methods:');
    for (const [method, op] of Object.entries<any>(pathItem)) {
      if (!isHttpMethod(method)) continue;
      const reqSchema = op.requestBody?.content?.['application/json']?.schema;
      const reqType = reqSchema ? schemaToString(reqSchema) : '';
      const responses = op.responses || {};
      const status = Object.keys(responses)[0];
      const res = responses[status] || {};
      let resType = '';
      const resSchema = res.content?.['application/json']?.schema;
      if (resSchema) {
        resType = schemaToString(resSchema);
      } else if (res.description) {
        resType = res.description;
      }
      lines.push(`    ${method.toUpperCase()}(${reqType}): ${resType}`);
    }
    lines.push('}');
  }

  for (const path of Object.keys(paths)) {
    if (path === '/') continue;
    const segments = path.split('/').filter(Boolean);
    let parent = '/';
    for (let i = segments.length - 1; i >= 0; i--) {
      const candidate = '/' + segments.slice(0, i).join('/');
      if (pathSet.has(candidate)) {
        parent = candidate || '/';
        break;
      }
    }
    edges.push(`\`${parent}\` --> \`${path}\``);
  }

  return [...lines, ...edges].join('\n');
}

function schemaToString(schema: any): string {
  if (!schema) return '';
  if (schema.$ref) return refToName(schema.$ref);
  if (schema.type === 'array') {
    return schemaToString(schema.items) + '[]';
  }
  if (schema.type) return schema.type;
  return '';
}

function refToName(ref: string): string {
  return ref.split('/').pop() || ref;
}

function isHttpMethod(m: string): boolean {
  return ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(m.toLowerCase());
}
