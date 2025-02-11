<script>
  import { onMount } from "svelte";
  let {
    schema = {},
    data = $bindable(),
    mode = "view",
    data_valid = $bindable(false),
    new_doc,
    BBDB,
    bbdb_action,
  } = $props();

  import JsonEditor from "../utils/JSONEditor.svelte";
  let loaded = $state(false);

  onMount(() => {
    loaded = true;
  });
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12">
      {#if loaded}
        {#if mode == "view"}
          <h4>{data.caption}</h4>
          <img src={data.imageBase64} alt={data.caption} class="img-fluid" />

          <p><i>Source</i>: {data.source}</p>
        {:else if mode == "edit"}
          <JsonEditor bind:data {schema} bind:data_valid />
        {/if}
      {/if}
    </div>
  </div>
</div>
