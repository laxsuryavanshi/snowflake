<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';

  let { form } = $props();
  const next = page.url.searchParams.get('next') ?? '/';
</script>

<div class="grid place-content-center h-dvh">
  <div class="card bg-base-200 w-md shadow-md">
    <div class="card-body">
      <h2 class="card-title">Login</h2>
      <form class="flex flex-col gap-4" method="post" action="?/login" use:enhance>
        <input type="hidden" name="providerId" value="credentials" data-testid="providerId" />
        <input type="hidden" name="redirectTo" value={next} data-testid="redirectTo" />
        <label class="floating-label">
          <span>Email</span>
          <input
            class="input validator w-full"
            name="email"
            type="text"
            placeholder="Email"
            autocomplete="username"
            required
          />
        </label>
        <label class="floating-label">
          <span>Password</span>
          <input
            class="input validator w-full"
            name="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
        </label>
        <button class="btn btn-primary" type="submit">Login</button>
      </form>
      {#if form?.message}
        <div role="alert" class="alert alert-error alert-soft">
          <span>{form?.message}</span>
        </div>
      {/if}
    </div>
  </div>
</div>
