export function generateMermaid(spec: any): string {
  const lines = ['graph TD'];
  const paths = spec.paths || {};
  for (const [path, methods] of Object.entries<any>(paths)) {
    for (const [method, info] of Object.entries<any>(methods)) {
      const responses = info.responses || {};
      const status = Object.keys(responses)[0];
      const res = responses[status] || {};
      let label = status;
      const schema = res.content?.['application/json']?.schema;
      if (schema) {
        label += ': ' + schemaToString(schema);
      } else if (res.description) {
        label += ': ' + res.description;
      }
      lines.push(`  ${method.toUpperCase()}_${path.replace(/[\/#]/g, '_')} --> "${label}"`);
    }
  }
  return lines.join('\n');
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
