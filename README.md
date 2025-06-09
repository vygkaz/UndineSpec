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
  GET__users --> res1["200: User[]"]
  POST__users --> res2["201: User"]
```
