<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event,remove_some_keys } from "$lib/bbdb_actions.js";
  import SystemDoc from "./SystemDoc.svelte";
  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";
  let { doc, schema, editable = false, edit_mode = "internal" } = $props();
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
    doc = updatedData; // Update the data
    mode = "view"; // Return to view mode
  };

  onMount(() => {
    loaded = true;
  });

  const system_docs = ["system_key","system_log","system_setting","system_edge_constraint","system_edge","system_media"]
</script>

{#if loaded}
  {#if mode === "view"}
   
    <div class="container-fluid1">
      <div class="row">
        <div class="col-lg-12">
          <div class="mt-4 d-flex justify-content-between align-items-center">
            <h4 class="mb-0">{schema.title || "Document"}</h4>

            <div class="d-flex align-items-center">
              <span class="me-2">{doc.meta.link}</span>
              <button
                class="btn btn-outline-primary btn-sm"
                aria-label="Copy link to clipboard"
                onclick={() => {
                  copy_to_clipboard(doc.meta.link);
                }}
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
              </svg>
              </button>
            </div>
            
          </div>
          <hr>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-9 mb-3 mb-md-0 fw-lighter">
         


          {#if system_docs.includes(doc.schema)}

            <SystemDoc {doc} {schema} {edit_mode} {editable}/>
          {:else if doc.schema=="schema"}
            
            <ObjectViewer title="Schema details" data={remove_some_keys(doc.data,["settings","schema"])}  />


            <ObjectViewer title="Schema settings" data={doc.data.settings}  />

            <div class="card">
              <div class="card-header">
                Schema 
              </div>
              <pre>{JSON.stringify(doc.data.schema, null, 2)}</pre>
            </div>
          {:else}
          <pre>{JSON.stringify(doc.data, null, 2)}</pre>
            User schema
          {/if}


        </div>
        <div class="col-12 col-md-3 fw-lighter">
          
          <div class="list-group">
            <li class="list-group-item">
              <div class="d-flex">
                <div class="p-2 flex-grow-1 text-secondary"><i>Created</i></div>
                <div class="p-2">{format_timestamp(doc.meta.created_on)}</div>
              </div>
            </li>
            {#if doc.meta.updated_on}
            <li class="list-group-item">
              <div class="d-flex">
                <div class="p-2 flex-grow-1  text-secondary"><i>Updated</i></div>
                <div class="p-2">{format_timestamp(doc.meta.updated_on)}</div>
              </div>
            </li>
            {/if}
            {#if doc.meta.tags.length > 0}
            <li class="list-group-item">
              <span class="badge text-bg-secondary m-1">New</span> <span class="badge text-bg-secondary m-1">2020 12 12</span> <span class="badge text-bg-secondary m-1">Open</span> <span class="badge text-bg-secondary m-1">Amazing year</span> <span class="badge text-bg-secondary m-1">Awesome</span>
            </li>
            {/if}
           
          </div>
        </div>
      </div>

    </div>
    <div class="container1">
    

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



