<script>
  import { onMount } from "svelte";

  import JsonEditor from "../utils/JSONEditor.svelte";
  import ObjectViewer2 from "../utils/ObjectViewer2.svelte";

  let {
    data = $bindable({}),
    schema = {},
    mode = "view",
    new_doc = false,
    BBDB,
    bbdb_action,
    data_valid = $bindable(),
  } = $props();
  let editor = $state("form");

  let loaded = $state(false);

  onMount(() => {
    loaded = true;
  });

  const change_editor = (new_editor) => {
    loaded = false;
    editor = new_editor;
    loaded = true;
  };
</script>

{#if mode == "edit"}
  <JsonEditor bind:data {schema} bind:data_valid={data_valid} />

{:else if mode == "view"}
<div class="pt-3">
  <ObjectViewer2 data={data}/>
</div>

{/if}
