<script>
  import { onMount } from "svelte";
  let { logs } = $props();
  let loaded= $state(false)
  onMount(async () => {
    loaded = true
  });
</script>

<h5>System logs</h5>
{#if loaded}
  <div class="row">
    <div class="col-lg-12">
      {#each logs as log}
      <div class="card">
        <div class="card-header">
          <strong>{log.data.app}</strong> - {new Date(log.data.time * 1000).toLocaleString()}
        </div>
        <div class="card-body">
          <p><strong>Message:</strong> {log.data.text}</p>
          {#if log.data.data?.steps}
            <details>
              <summary><strong>Steps:</strong></summary>
              <ul class="list-group">
                {#each log.data.data.steps as step}
                  <li class="list-group-item">{step}</li>
                {/each}
              </ul>
            </details>
          {/if}
        </div>
      </div>
      {/each}

    </div>
  </div>
{/if}
