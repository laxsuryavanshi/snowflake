<script lang="ts">
  import type { Experience } from '../types';

  let activeTab = $state(0);
  const { experiences }: { experiences: Experience[] } = $props();
</script>

<div class="flex flex-col items-center gap-16 py-24 px-4">
  <h2 class="text-4xl font-bold text-center hover-underline">Experience</h2>

  <div class="w-full max-w-6xl flex flex-col md:flex-row gap-8">
    <!-- Vertical Tabs (Company Names) -->
    <div class="flex md:flex-col gap-2 md:min-w-[250px] overflow-x-auto md:overflow-x-visible">
      {#each experiences as exp, index}
        <button
          class="tab tab-bordered px-6 py-4 text-left transition-all duration-200 whitespace-nowrap
                 {activeTab === index
            ? 'tab-active border-l-4 border-primary bg-base-200 font-semibold'
            : 'border-l-4 border-transparent hover:bg-base-200'}"
          onclick={() => (activeTab = index)}
        >
          {exp.company}
        </button>
      {/each}
    </div>

    <!-- Tab Content (Experience Details) -->
    <div class="flex-1 bg-base-200 border border-base-200 rounded-lg p-8 min-h-[300px]">
      {#each experiences as exp, index}
        {#if activeTab === index}
          <div class="animate-fade-in">
            <h3 class="text-2xl font-bold mb-2">{exp.position}</h3>
            <p class="text-primary font-semibold mb-2">@ {exp.company}</p>
            <p class="text-sm text-base-content/70 mb-6">{exp.duration}</p>

            <ul class="space-y-3">
              {#each exp.description as item}
                <li class="flex gap-3">
                  <span class="text-primary mt-1">▹</span>
                  <span class="flex-1">{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>
