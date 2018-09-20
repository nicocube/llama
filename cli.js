#!/usr/bin/env node
/*
 * Copyright 2018 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

const argv = require('yargs')
  , fs = require('fs')
  , path = require('path')

argv
  .usage('Usage: $0 <command> [options]')
  .command('index <folder>', 'build static site from', (yargs) => {
    yargs.positional('folder', {
      describe: 'the folder to build index from',
      type: 'string'
    })
    .option('extensions', {
      alias: 'e',
      describe: 'change the file\'s extensions to be indexed',
      type: 'string',
      default: '.md'
    })
  },
  ({folder}) => {
    buildIndex(folder)
  })
  .command('build [index] [output]', 'build static site from', (yargs) => {
    yargs.positional('input', {
      describe: 'the index to build from',
      type: 'string',
      default: './index.yml'
    })
    .positional('output', {
      describe: 'the folder to build to',
      type: 'string',
      default: './dist'
    })
  },
  ({input, output}) => {
    buildSite(input, output)
  })
  /*
  .option('verbose', {
    alias: 'v',
    default: false
  })
  */
  .demandCommand(1, 'You need at least one command before moving on')
  .help(false)
  .argv


function buildIndex(folder) {
  console.log(folder)
  if (fs.statSync(folder).isDirectory()) {
    let dir = fs.readdirSync(folder)
    dir.forEach(d => console.log(' ' + d))
  }
}

function buildSite(input, output) {
  console.log(input, output)
  if (fs.statSync(input).isDirectory()) {
    fs.readdirSync(input)
    
  }
}