export function generateMermaid(spec: any): string {
  const lines: string[] = ['classDiagram'];
  const root = spec.servers?.[0]?.url || '/';
  const rootId = sanitizeId(root);
  lines.push(`class ${rootId}["${root}"] {`);
  lines.push('  <<Path>>');
  lines.push('}');

  const classBlocks: string[] = [];
  const relations: string[] = [];

  const paths = spec.paths || {};
  const sortedPaths = Object.keys(paths).sort();

  for (const path of sortedPaths) {
    const pathItem: any = paths[path];
    const pathId = sanitizeId(path);
    classBlocks.push(buildClassBlock(path, pathId, pathItem));
    const parent = findParentPath(path, sortedPaths);
    const parentId = parent ? sanitizeId(parent) : rootId;
    relations.push(`${parentId} --> ${pathId}`);
  }

  return lines.concat(classBlocks).concat(relations).join('\n');
}

function buildClassBlock(path: string, id: string, pathItem: any): string {
  const lines: string[] = [];
  lines.push(`class ${id}["${path}"] {`);
  lines.push('  <<Path>>');
  lines.push('');
  lines.push('  Query Parameters:');
  const params = collectQueryParams(pathItem);
  if (params.length === 0) {
    lines.push('    (none)');
  } else {
    for (const p of params) {
      const name = p.required
        ? `<span style=\"color:red\">${p.name}</span>`
        : p.name;
      const type = schemaToString(p.schema);
      lines.push(`    • ${name}: ${type}`);
    }
  }
  lines.push('');
  lines.push('  HTTP methods:');
  for (const [method, op] of Object.entries<any>(pathItem)) {
    if (!isHttpMethod(method)) continue;
    const reqType = getRequestType(op);
    const resType = getResponseType(op);
    let line = `    • ${method.toUpperCase()}(`;
    line += reqType ? reqType : '';
    line += ')';
    if (resType) line += `: ${resType}`;
    lines.push(line);
  }
  lines.push('}');
  return lines.join('\n');
}

function collectQueryParams(pathItem: any): any[] {
  const allParams = new Map<string, any>();
  const addParam = (p: any) => {
    if (p.in === 'query') {
      allParams.set(p.name, p);
    }
  };
  for (const p of pathItem.parameters || []) addParam(p);
  for (const [method, op] of Object.entries<any>(pathItem)) {
    if (!isHttpMethod(method)) continue;
    for (const p of op.parameters || []) addParam(p);
  }
  return Array.from(allParams.values());
}

function getRequestType(op: any): string | '' {
  const rb = op.requestBody;
  const schema = rb?.content?.['application/json']?.schema;
  return schema ? schemaToString(schema) : '';
}

function getResponseType(op: any): string | '' {
  const res = op.responses || {};
  const status = Object.keys(res)
    .filter((s) => /^2/.test(s))
    .sort()[0];
  const chosen = status ? res[status] : undefined;
  const schema = chosen?.content?.['application/json']?.schema;
  if (schema) return schemaToString(schema);
  if (chosen?.description) return chosen.description;
  return '';
}

function isHttpMethod(m: string): boolean {
  return ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(m);
}

function findParentPath(path: string, sortedPaths: string[]): string | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return null;
  segments.pop();
  while (segments.length) {
    const parent = '/' + segments.join('/');
    if (sortedPaths.includes(parent)) return parent;
    segments.pop();
  }
  return null;
}

function schemaToString(schema: any): string {
  if (!schema) return '';
  if (schema.$ref) return refToName(schema.$ref);
  if (schema.type === 'array') return schemaToString(schema.items) + '[]';
  if (schema.type) return schema.type;
  return '';
}

function refToName(ref: string): string {
  return ref.split('/').pop() || ref;
}

function sanitizeId(path: string): string {
  let id = path.replace(/[{}]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
  id = id.replace(/^_+/, '');
  if (!/[a-zA-Z0-9]/.test(id)) id = 'root';
  if (!/^[A-Za-z_]/.test(id)) id = 'p_' + id;
  return id;
}
