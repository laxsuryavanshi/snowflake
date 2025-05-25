<script lang="ts">
  let name = $state('');
  let roomId = $state('');
</script>

<div class="hero bg-base-200 min-h-dvh">
  <div class="hero-content">
    <div class="card bg-base-100 w-md">
      <div class="card-body py-8">
        <div class="card-title mb-4">Welcome to Skylr</div>

        <form class="flex flex-col gap-4">
          <label class="input validator w-full">
            <input bind:value={name} type="text" placeholder="Your Name" required />
          </label>
          <button class="btn btn-primary" type="submit">Create a new Room</button>
        </form>

        <div class="divider">OR</div>

        <form class="flex flex-col gap-4">
          <label class="input validator w-full">
            <input bind:value={roomId} type="text" placeholder="Room ID" required />
          </label>
          <button class="btn btn-secondary" type="submit">Join an existing Room</button>
        </form>
      </div>
    </div>
  </div>
</div>
