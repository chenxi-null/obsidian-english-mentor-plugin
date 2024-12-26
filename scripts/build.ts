import { exec } from 'child_process';
import * as path from 'path';

const pluginPath = process.argv[2];
if (!pluginPath) {
  console.error('Please provide the plugin installation path as an argument');
  process.exit(1);
}

const buildCommand = 'obsidian-plugin build src/main.ts';
const copyCommand = `cp -r dist ${path.resolve(pluginPath)}`;

exec(`${buildCommand} && ${copyCommand}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
}); 