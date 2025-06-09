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
classDiagram
class root["/"] {
  <<Path>>
}
class users["/users"] {
  <<Path>>

  Query Parameters:
    (none)

  HTTP methods:
    • GET(): User[]
    • POST(): User
}
root --> users
```
