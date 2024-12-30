<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event,remove_some_keys,download_data } from "$lib/bbdb_actions.js";
  import SystemDoc from "./SystemDoc.svelte";
  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";
  import TagsEditor from "$lib/utils/TagsEditor.svelte";
  import LinkEditor from "$lib/utils/LinkEditor.svelte";
  let { doc, schema, editable = false, edit_mode = "internal" , bbdb_action } = $props();
  let loaded = $state(false);
  let mode = $state("view");

  import ObjectViewer2 from "$lib/utils/ObjectViewer2.svelte";
  const edit_external = () => {
    console.log("External edit triggered with data:", data);
    // Implement external edit logic here
  };

  const edit_internal = () => {
    mode = "edit";
  };

  const save_changes = (updatedData) => {
    //console.log("Saving changes:", updatedData);
    doc = updatedData; // Update the data
    mode = "view"; // Return to view mode
  };

  onMount(() => {
    //console.log(schema)
    loaded = true;
  });

  const util_action_handler = async (data)=>{
    console.log(data)
    data.data.rev = doc._rev
    let resp = await bbdb_action(data)
    return resp 
  }

  const system_docs = ["system_key","system_log","system_setting","system_edge_constraint","system_edge","system_media"]
</script>

{#if loaded}
  {#if mode === "view"}
   
      <div class="row">
        <div class="col-lg-12 pt-2 pb-2 ">
          <div class="mt-4 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{schema.title || "Document"}</h5>

            <div class="d-flex align-items-center">
              <button
                title="Click to copy link to clipboard"
                class="btn btn-link btn-sm"
                aria-label="Copy link to clipboard"
                onclick={() => {
                  copy_to_clipboard(doc.meta.link);
                }}
              >
              {doc.meta.link}
              
              </button>
              <button title="Download file as json" class='btn btn-link btn-sm' onclick={()=>{ download_data({doc,schema},`${doc.meta.link}.json`) }} aria-label="JSON">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                </svg>
              </button>

               
            {#if editable}
            <button
              class="btn btn-primary mt-3"
              onclick={() => (edit_mode === "external" ? edit_external() : edit_internal())}
            >
              Edit
            </button>
          {/if}

            </div>
            
          </div>
          <!-- <hr> -->
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12 p-2">
         
          {#if system_docs.includes(doc.schema)}
            <SystemDoc {doc} {schema} {edit_mode} {editable}/>
          {:else}
            <ObjectViewer2 data={doc.data} schema={schema.schema}/>
          {/if}

        </div>
        <div class="col-lg-12 fw-lighter p-2">
          
          <div class="list-group ">
            <li class="list-group-item list-group-item-light">
              <div class="p-1"><i>Created</i></div>
              <div class="p-1">{format_timestamp(doc.meta.created_on)}</div>
            </li>
            <li class="list-group-item list-group-item-light">
             
                <div class="p-1"> <i>Tags</i></div>  
                <div class="p-1"><TagsEditor  bbdb_action={util_action_handler} link={doc.meta.link}  tags={doc.meta.tags}/></div>
              
            </li>
            {#if doc.meta.updated_on}
            
            <li class="list-group-item list-group-item-light">
             
                <div class="p-2 "><i>Updated</i></div>
                <div class="p-2">{format_timestamp(doc.meta.updated_on)}</div>
              
            </li>
            {/if}     
            <li class="list-group-item list-group-item-light">
              <div class="p-1"> <i>Link</i></div>  
              <LinkEditor  bbdb_action={util_action_handler} bind:link={doc.meta.link}/>
              
            </li>      
          </div>
        </div>

        

      </div>

    
  {:else if mode === "edit"}
    <div class="container">
      <h4>Editing Document</h4>
    </div>
  {/if}
{:else}
  <div class="container text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p>Loading document...</p>
  </div>
{/if}



