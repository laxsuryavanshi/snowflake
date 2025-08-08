import Angular from './Angular.svelte';
import Task from './AWS.svelte';
import Docker from './Docker.svelte';
import Git from './Git.svelte';
import GitHub from './GitHub.svelte';
import JavaScript from './JavaScript.svelte';
import Kubernetes from './Kubernetes.svelte';
import LinkedIn from './LinkedIn.svelte';
import Linux from './Linux.svelte';
import Mail from './Mail.svelte';
import MongoDB from './MongoDB.svelte';
import NextJS from './NextJS.svelte';
import NodeJS from './NodeJS.svelte';
import OpenJDK from './OpenJDK.svelte';
import PostgreSQL from './PostgreSQL.svelte';
import React from './React.svelte';
import SpringBoot from './SpringBoot.svelte';
import Svelte from './Svelte.svelte';
import TypeScript from './TypeScript.svelte';

export function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'angular':
      return Angular;
    case 'docker':
      return Docker;
    case 'git':
      return Git;
    case 'github':
      return GitHub;
    case 'javascript':
      return JavaScript;
    case 'kubernetes':
      return Kubernetes;
    case 'linkedin':
      return LinkedIn;
    case 'linux':
      return Linux;
    case 'mail':
      return Mail;
    case 'mongodb':
      return MongoDB;
    case 'nextjs':
      return NextJS;
    case 'nodejs':
      return NodeJS;
    case 'openjdk':
      return OpenJDK;
    case 'postgresql':
      return PostgreSQL;
    case 'react':
      return React;
    case 'springboot':
      return SpringBoot;
    case 'svelte':
      return Svelte;
    case 'task':
      return Task;
    case 'typescript':
      return TypeScript;
    default:
      return null;
  }
}
