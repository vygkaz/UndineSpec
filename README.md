# UndineSpec

Generate Mermaid diagrams from OpenAPI specifications.

## Usage

```
npx ts-node bin/undinespec.ts <spec-file>
```

### Example

```
npx ts-node bin/undinespec.ts examples/sample.yaml
```

Output:

```
graph TD
  GET_/users --> "200: User[]"
  POST_/users --> "201: User"
```
