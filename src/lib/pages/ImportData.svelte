<script>
  import { onMount } from "svelte";

  let {BBDB,bbdb_action} = $props()
  let jsonData = $state("");
  let isLoading = $state(false);
  let errorMessage = $state("");
  let createdDocs = $state([]);
  import {emit_bbdb_event} from "$lib/bbdb_actions.js"


  function processBulkImport() {
    errorMessage = "";
    createdDocs = [];
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (e) {
      errorMessage = "Invalid JSON format!";
      return;
    }

    if (!parsedData.records || !Array.isArray(parsedData.records)) {
      errorMessage = "Error: JSON must contain a 'records' array.";
      return;
    }

    isLoading = true;
    
  
    // Simulate processing
    setTimeout(() => {
      createdDocs = processRecords(parsedData.records);
      isLoading = false;
    }, 1000);
  }

  const open_link = (link)=>{
    bbdb_action(emit_bbdb_event("textcmd", {text:`open/link/${link}`}))
  }
    

  function processRecords(records) {
    console.log("Processing records...");
    return records.map((_, index) => `doc_${index + 1}`);
  }
</script>

<div class="container mt-4">
  <h3>Bulk Data Import</h3>
  
  <textarea
    class="form-control"
    rows="6"
    bind:value={jsonData}
    placeholder=""
    disabled={isLoading}
  ></textarea>

  {#if errorMessage}
    <div class="alert alert-danger mt-2">{errorMessage}</div>
  {/if}

  <button class="btn btn-primary mt-2" onclick={processBulkImport} disabled={isLoading}>
    {isLoading ? "Processing..." : "Import Data"}
  </button>

  {#if createdDocs.length}
    <div class="alert alert-success mt-3">
      <strong>Created {createdDocs.length} documents:</strong>
        {#each createdDocs as doc}
          <button class="btn btn-link" onclick={()=>{open_link(doc.meta.link)}} >{doc.meta.title}</button>
        {/each}
      
    </div>
  {/if}
</div>
