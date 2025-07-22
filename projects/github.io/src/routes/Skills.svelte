<script lang="ts">
  import {
    Angular,
    Docker,
    Git,
    JavaScript,
    Kubernetes,
    Linux,
    MongoDB,
    NextJS,
    NodeJS,
    OpenJDK,
    PostgreSQL,
    React,
    SpringBoot,
    Svelte,
    Task,
    TypeScript,
  } from '$lib/icons';

  function getIconComponent(iconName: string) {
    switch (iconName) {
      case 'javascript':
        return JavaScript;
      case 'typescript':
        return TypeScript;
      case 'angular':
        return Angular;
      case 'react':
        return React;
      case 'nextjs':
        return NextJS;
      case 'svelte':
        return Svelte;
      case 'openjdk':
        return OpenJDK;
      case 'springboot':
        return SpringBoot;
      case 'nodejs':
        return NodeJS;
      case 'postgresql':
        return PostgreSQL;
      case 'mongodb':
        return MongoDB;
      case 'task':
        return Task;
      case 'git':
        return Git;
      case 'docker':
        return Docker;
      case 'kubernetes':
        return Kubernetes;
      case 'linux':
        return Linux;
      default:
        return null;
    }
  }

  export let skills: {
    type: string;
    label: string;
    skills: {
      type: string;
      label: string;
      icon: string;
      color: string;
    }[];
  }[];
</script>

<div class="flex flex-col items-center gap-16 py-24">
  <h2 class="text-4xl font-bold text-center hover-underline">Skills</h2>

  <div class="flex flex-col items-center gap-8">
    {#each skills as skillGroup}
      <div class="flex justify-center items-center w-4xl max-w-dvw gap-8">
        {#each skillGroup.skills as skill}
          {@const IconComponent = getIconComponent(skill.icon)}
          <div class="card card-xs bg-base-200 w-48 px-4 py-2 shadow rounded-xl">
            <div class="card-body flex-row">
              <div class="h-12 w-12" style:color={skill.color}>
                <IconComponent />
              </div>
              <div class="card-title whitespace-nowrap">{skill.label}</div>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .card:hover {
    transform: translateY(-0.2rem);
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease-in-out;
  }
</style>
