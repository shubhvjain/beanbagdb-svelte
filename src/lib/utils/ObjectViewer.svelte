<script>
  let { data ,title,labels={}} = $props();
    // Initialize tooltips
  import { onMount } from "svelte";



  onMount(() => {
    // Dynamically import Bootstrap for environments without global `bootstrap` variable
    import("bootstrap").then(({ Tooltip }) => {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
    });
  });
</script>

<div class="mt-3 mb-3">
  <div class="card">
    <div class="card-header">
      <strong>{title||"Details"}</strong>
    </div>
    <div class="card-body">
      {#if Object.keys(data).length > 0}
        <table class="table table-striped">
          <!-- <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead> -->
          <tbody>
            {#each Object.entries(data) as [key, value]}
              <tr>
                <td>
                  {#if labels[key]?.label}
                    <span
                      data-bs-toggle="tooltip"
                      title={labels[key]?.help || ""}
                      style="cursor: help;"
                    >
                      {labels[key].label}
                    </span>
                  {:else}
                    {key}
                  {/if}
                </td>
                <td>{typeof value === "boolean" ? (value ? "True" : "False") : value}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No data available to display.</p>
      {/if}
    </div>
  </div>
</div>
