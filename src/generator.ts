export function generateMermaid(spec: any): string {
  const lines: string[] = [];
  const edges: string[] = [];
  lines.push('classDiagram');

  const paths = spec.paths || {};
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
    const parentSegments = segments.slice(0, -1);
    let parent = '/';
    if (parentSegments.length > 0) {
      parent += parentSegments.join('/');
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
