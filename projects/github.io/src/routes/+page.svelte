<script lang="ts">
  import { getIconComponent } from '$lib/icons';
  import { Experience, Hero, Projects, Skills, ThemeController } from '$lib/components';

  const { data } = $props();
  const { author, cvLink, heroImage, introduction, experiences, projects, skills, socialLinks } =
    data;
  const currentYear = new Date().getFullYear();
</script>

<header>
  <div class="text-xl font-bold">
    <a href="/">{author}</a>
  </div>
  <div class="ml-auto">
    <ThemeController />
  </div>
</header>

<main>
  <section id="hero">
    <Hero {author} {introduction} image={heroImage} {cvLink} />
  </section>

  <div class="divider mx-8"></div>

  <section id="skills">
    <Skills {skills} />
  </section>

  <div class="divider mx-8"></div>

  <section id="experience">
    <Experience {experiences} />
  </section>

  <div class="divider mx-8"></div>

  <section id="projects">
    <Projects {projects} />
  </section>
</main>

<footer class="footer-center">
  <nav class="grid grid-flow-col gap-4">
    {#each socialLinks as link}
      {@const IconComponent = getIconComponent(link.icon)}
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        <IconComponent />
      </a>
    {/each}
  </nav>
  <aside>
    <p>Copyright &copy; {currentYear} {author}. All rights reserved.</p>
  </aside>
</footer>

<style>
  @reference '../app.css';

  header {
    @apply sticky top-0 z-50 bg-neutral text-neutral-content backdrop-blur shadow transition-shadow
           duration-100 h-16 px-8 flex items-center;
  }

  footer {
    @apply footer footer-horizontal bg-neutral text-neutral-content p-10;
  }
</style>
