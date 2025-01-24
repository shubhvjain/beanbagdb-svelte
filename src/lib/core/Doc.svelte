<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event,remove_some_keys,download_data } from "$lib/bbdb_actions.js";
  import SystemDoc from "./SystemDoc.svelte";
  import ObjectViewer from "$lib/utils/ObjectViewer.svelte";
  import TagsEditor from "$lib/utils/TagsEditor.svelte";
  import LinkEditor from "$lib/utils/LinkEditor.svelte";
  import JsonEditor from "$lib/utils/JSONEditor.svelte";
  import SchemaEditor from "$lib/utils/SchemaEditor.svelte";
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
          <i class="bi bi-download"></i>
        </button>

         
      {#if editable}
        {#if mode == "view"}
        <button
        class="btn btn-link btn-sm"
        onclick={() => (edit_mode === "external" ? edit_external() : edit_internal())}
      >
        <i class="bi bi-pencil"></i>
        Edit
      </button>
        {:else}
        
        <button
        class="btn btn-link btn-sm"
        onclick={() => (edit_mode === "external" ? edit_external() : edit_internal())}
      >
        <i class="bi bi-floppy"></i>
        Save
      </button>
        {/if}
     
      {/if}

      </div>
      
    </div>
  </div>
</div>



  {#if mode === "view"}
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
    <div class="row">
      <div class="col-lg-12">
        {#if doc.schema=="schema"}
          <SchemaEditor data={doc.data} schema={schema.schema} />
        {:else}
          <JsonEditor bind:data={doc.data} schema={schema.schema}/>
        {/if}
      </div>
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



