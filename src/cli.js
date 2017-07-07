#!/usr/bin/env node
// @flow

function helloWorld (name: string): string {
  return `hello ${name}`
}

console.log(helloWorld('world'))
