<script lang="ts">
  export let author: string;
  export let introduction: string;
  export let image: string;
  export let cvLink: string;
</script>

<div class="hero">
  <div class="hero-content w-full justify-around">
    <div class="max-w-md flex flex-col gap-4 items-start">
      <p>Hi there!</p>
      <h1 class="text-4xl font-bold">I'm {author}</h1>
      <p class="text-justify">{introduction}</p>
      <a class="btn btn-info mt-4" href={cvLink} target="_blank" rel="noopener noreferrer">
        Checkout my CV
      </a>
    </div>
    <img class="max-w-md" src={image} alt="" />
  </div>
</div>

<style>
  .hero {
    height: calc(100dvh - 4rem);
  }
</style>
