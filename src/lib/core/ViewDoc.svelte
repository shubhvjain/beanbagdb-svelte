<script>
  import { onMount } from "svelte";

  let { data, schema, editable = false, edit_mode = "internal" } = $props();
  let loaded = $state(false);
  let mode = $state("view");

  const edit_external = () => {
    console.log("External edit triggered with data:", data);
    // Implement external edit logic here
  };

  const edit_internal = () => {
    mode = "edit";
  };

  const save_changes = (updatedData) => {
    console.log("Saving changes:", updatedData);
    data = updatedData; // Update the data
    mode = "view"; // Return to view mode
  };

  onMount(() => {
    loaded = true;
  });
</script>

{#if loaded}
  {#if mode === "view"}
    <!-- Object Viewer Placeholder -->
    <div class="container">
      <pre>{JSON.stringify(data, null, 2)}</pre>

      {#if editable}
        <button
          class="btn btn-primary mt-3"
          onclick={() => (edit_mode === "external" ? edit_external() : edit_internal())}
        >
          Edit
        </button>
      {/if}
    </div>
  {:else if mode === "edit"}
    <!-- Edit Document Component Placeholder -->
    <div class="container">
      <h4>Editing Document</h4>
    </div>
  {/if}
{:else}
  <!-- Loading Placeholder -->
  <div class="container text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p>Loading document...</p>
  </div>
{/if}
