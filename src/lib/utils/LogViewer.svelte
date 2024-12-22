<script>
  import { onMount } from "svelte";
  let { logs } = $props();
  let loaded = $state(false);
  onMount(async () => {
    loaded = true;
  });
</script>

<details open>
  <summary>System logs</summary>

  {#if loaded}
    <div class="row">
      <div class="col-lg-12">
        {#if logs.length > 0}
          <table class="table table-striped">
            <thead>
              <tr>
                <th>App</th>
                <th>Message</th>
                <th>Time</th>
                <th>Steps</th>
              </tr>
            </thead>
            <tbody>
              {#each logs as log}
                <tr>
                  <td>{log.data.app}</td>
                  <td>{log.data.text}</td>
                  <td>{new Date(log.data.time * 1000).toLocaleString()}</td>
                  <td>
                    {#if log.data.data?.steps}
                      <details>
                        <summary>View Steps</summary>
                        <ul class="list-group">
                          {#each log.data.data.steps as step}
                            <li class="list-group-item">{step}</li>
                          {/each}
                        </ul>
                      </details>
                    {:else}
                      <em>No steps available</em>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <p>No logs available to display.</p>
        {/if}
      </div>
    </div>
  {/if}
</details>
