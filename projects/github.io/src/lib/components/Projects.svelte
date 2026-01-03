<script lang="ts">
  import { GitHub, Link } from '$lib/icons';
  import type { Project } from '../types';

  const { projects }: { projects: Project[] } = $props();

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);
</script>

<div class="flex flex-col items-center gap-16 py-24 px-4">
  <h2 class="text-4xl font-bold text-center hover-underline">Projects</h2>

  <!-- Featured Projects Grid -->
  {#if featuredProjects.length > 0}
    <div class="w-full max-w-7xl">
      <h3 class="text-2xl font-semibold mb-8 text-center">Featured Projects</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {#each featuredProjects as project}
          <div
            class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary"
          >
            <div class="card-body">
              <!-- Header with Featured Badge -->
              <div class="flex justify-between items-start mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-14 h-14 text-primary"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
                <span class="badge badge-primary badge-lg">Featured</span>
              </div>

              <h3 class="card-title text-2xl mb-2">{project.title}</h3>
              <p class="text-base-content/80 mb-4">{project.description}</p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mt-4">
                {#each project.tags as tag}
                  <span class="badge badge-outline">{tag}</span>
                {/each}
              </div>

              <!-- Action Buttons -->
              <div class="card-actions justify-end mt-4">
                {#if project.github}
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-ghost btn-sm btn-circle"
                  >
                    <GitHub />
                  </a>
                {/if}
                {#if project.demo}
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary btn-sm gap-2 btn-circle"
                  >
                    <Link />
                  </a>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Other Projects Grid -->
  {#if otherProjects.length > 0}
    <div class="w-full max-w-7xl">
      <h3 class="text-2xl font-semibold mb-8 text-center">Other Notable Projects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each otherProjects as project}
          <div
            class="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="card-body">
              <!-- Icon Header -->
              <div class="flex justify-between items-start mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-12 h-12 text-primary"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                  />
                </svg>
                <div class="flex gap-2">
                  {#if project.github}
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-ghost btn-xs btn-circle"
                      aria-label="View source code on GitHub"
                    >
                      <GitHub />
                    </a>
                  {/if}
                  {#if project.demo}
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-ghost btn-xs btn-circle"
                      aria-label="View live demo"
                    >
                      <Link />
                    </a>
                  {/if}
                </div>
              </div>

              <h3 class="card-title text-xl">{project.title}</h3>
              <p class="text-sm text-base-content/80">{project.description}</p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mt-4">
                {#each project.tags as tag}
                  <span class="badge badge-sm badge-outline">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
