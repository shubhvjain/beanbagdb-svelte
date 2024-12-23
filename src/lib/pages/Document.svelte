<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event } from "$lib/bbdb_actions.js";
  import Doc from "$lib/core/Doc.svelte";
  let { page_bbdb_action, BBDB, page } = $props();
  let mode = $state("view");
  let loaded = $state(false);
  let loading = $state(true);
  let error = $state(null);
  let documentData = $state({});

  async function load_doc(page1) {
    let doc = await BBDB.plugins.txtcmd.run(page1);
    console.log(doc);
    return doc.result;
  }


  onMount(async () => {
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      console.log(page);
      documentData = await load_doc(page);
      console.log("111");
      loaded = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function on_bbdb_action(data) {
    if (page_bbdb_action) {
      page_bbdb_action(data);
    } else {
      console.log(data);
    }
  }
</script>

<div>
  {#if loading}
    <p>Loading document...</p>
  {:else if error}
    <p class="text-danger">Error: {error}</p>
  {:else if loaded && documentData}
  <div class="container-fluid">
    <Doc doc={documentData.doc} schema={documentData.schema} />
  </div>
   
  {/if}
</div>
