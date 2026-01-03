<script lang="ts">
  import { getIconComponent } from '$lib/icons';

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

  <div class="flex flex-wrap justify-center gap-8 px-4 max-w-screen-lg">
    {#each skills as skillGroup}
      {#each skillGroup.skills as skill}
        {@const IconComponent = getIconComponent(skill.icon)}
        <div
          class="card card-xs bg-base-200 w-48 px-4 py-2 shadow rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out"
        >
          <div class="card-body flex-row items-center gap-4">
            <div class="h-12 w-12 flex-shrink-0" style:color={skill.color}>
              <IconComponent />
            </div>
            <h3 class="card-title text-base whitespace-nowrap">{skill.label}</h3>
          </div>
        </div>
      {/each}
    {/each}
  </div>
</div>
