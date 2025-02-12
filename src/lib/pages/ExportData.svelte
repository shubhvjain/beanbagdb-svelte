<script>
  import * as PouchDB from "../db/pouchdb.min.js";
  import { onMount } from "svelte";
  //  import {  emit_bbdb_event } from "$lib/bbdb_actions.js";
  //  import Doc from "$lib/core/Doc.svelte";
  let { page_bbdb_action, BBDB, page, custom_editors } = $props();
  let loaded = $state(false);
  let error = $state(null);
  //  let documentData = $state({});
  let pdb= $state(null)

  let options = $state({})


  onMount(async () => {
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      pdb = new window.PouchDB(BBDB.meta.database_name);
      options["file_name"] = `${BBDB.meta.database_name}-${Date.now()}.json`;
      options["include_id"] = true
      options["include_metadata_doc"] = false
      //options["schema_filer"] = ""

      console.log(BBDB.meta)

      loaded = true;
    } catch (err) {
      error = err.message;
      loaded = false;
    }
  });

  async function exportDocuments(option) {
    const result = await pdb.allDocs({ include_docs: true });
    let documents = result.rows.map((row) => row.doc);

    if (!option.include_id) {
      documents = documents.map(({ _id, _rev, ...doc }) => doc);
    }

    option["download_date"] = new Date().toISOString()

    if(option["include_metadata_doc"]==true){
      option["bbdb_metadata"] = {name:BBDB.meta.database_name ,encryption_key: BBDB.encryption_key }
    }

    downloadJSON({data:documents,export_option:option}, option.file_name);
    
  }

  function downloadJSON(data, name) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  }
</script>

<div>
  {#if loaded == false}
    <p>Loading document...</p>
    {#if error}
      <p class="text-danger">{error}</p>
    {/if}
  {:else if loaded == true}
    <div class="container mt-4">
      <h4>Export data as JSON</h4>
      <hr>
      <div class="mb-3">
        <label class="form-label">Filename:</label>
        <input type="text" class="form-control" bind:value={options.file_name} />
      </div>
      <div class="form-check mb-3">
        <input
          type="checkbox"
          class="form-check-input"
          bind:checked={options.include_id}
          id="includeIds"
        />
        <label class="form-check-label" for="includeIds">Include IDs</label>
      </div>
      <div class="form-check mb-3">
        <input
          type="checkbox"
          class="form-check-input"
          bind:checked={options.include_metadata_doc}
          id="includemeta"
        />
        <label class="form-check-label" for="includemeta">Include Sensitive Metadata</label>
      </div>
      <!-- <div class="mb-3">
        <label for="1" class="form-label">Schema Filter for separate document(comma-separated):</label>
        <input id="1" type="text" class="form-control" bind:value={options.schema_filter} />
      </div> -->
      <button class="btn btn-primary" onclick={()=>exportDocuments(options)}
        >Export Documents</button
      >
    </div>
  {/if}
</div>
