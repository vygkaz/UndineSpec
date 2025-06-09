#!/usr/bin/env ts-node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { generateMermaid } from '../src/generator';

const program = new Command();

program
  .name('undinespec')
  .argument('<spec>', 'OpenAPI spec file (YAML or JSON)')
  .action((specPath) => {
    const content = readFileSync(specPath, 'utf8');
    const data = specPath.endsWith('.json')
      ? JSON.parse(content)
      : yaml.load(content);
    console.log(generateMermaid(data));
  });

program.parse(process.argv);
