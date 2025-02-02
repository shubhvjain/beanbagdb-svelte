<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event,remove_some_keys,download_data } from "../bbdb_actions.js";
  import SystemDoc from "./SystemDoc.svelte";
  import ObjectViewer from "../utils/ObjectViewer.svelte";
  import TagsEditor from "../utils/TagsEditor.svelte";
  import LinkEditor from "../utils/LinkEditor.svelte";
  import JsonEditor from "../utils/JSONEditor.svelte";
  import SchemaEditor from "../editors/SchemaEditor.svelte";
  let { doc, schema, editable = false, edit_mode = "internal" , bbdb_action , custom_editors={}, BBDB} = $props();
  let loaded = $state(false);
  let mode = $state("view");
  let custom_editor_loaded = $state(false)
  let custom_editor_component = $state(null)
  let edit_mode_data_valid = $state(false)

  import ObjectViewer2 from "../utils/ObjectViewer2.svelte";
  const edit_external = () => {
    console.log("External edit triggered with data:", data);
    // Implement external edit logic here
  };

  const open_edit = ()=>{
    mode = "edit";
    edit_mode_data_valid = true
  }

  const edit_internal = async () => {
    try {
      
    //console.log("saving....")
    await bbdb_action(emit_bbdb_event("update_doc_data",{link:doc.meta.link,data:doc.data,rev:doc._rev}) )   
    } catch (error) {
      console.log(error)
    }

  };

  const save_changes = (updatedData) => {
    //console.log("Saving changes:", updatedData);
    doc = updatedData; // Update the data
    mode = "view"; // Return to view mode
  };

  onMount(() => {
    //console.log(custom_editors)
    if(custom_editors[schema.name]){
      console.log("Custom editor found")
      custom_editor_loaded = true
      if(custom_editors[schema.name]["component"]){
        custom_editor_component = custom_editors[schema.name]
        loaded = true;
      }else{
        loaded = false;
        throw new Error("Custom editor component not found") 
      }
    }else{
      loaded = true;
    }
    
  });

  const util_action_handler = async (data)=>{
    console.log(data)
    data.data.rev = doc._rev
    let resp = await bbdb_action(data)
    return resp 
  }

  const system_docs = ["system_key","system_log","system_setting","system_edge_constraint","system_edge","system_media"]

  let isTitleEditing = $state(false)
  function toggleTitleEdit() {
    isTitleEditing = !isTitleEditing;
  }

  async function saveTitle() {
    // Perform save logic here
    if(doc.meta.title.trim().length==0){
      await bbdb_action(emit_bbdb_event("show_ui_message",{type:"error",message:"Title cannot be blank"}))
    }else{
      let resp =  await bbdb_action(emit_bbdb_event("edit_partial_meta",{link:doc.meta.link,update:{data:{},meta:{title:doc.meta.title}}}))
      console.log(resp)
      toggleTitleEdit();
    }
    
  }
</script>

{#if loaded}


<div class="row">
  <div class="col-lg-12 pt-2 pb-2 ">
    <div class="mt-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        {#if isTitleEditing}
          <!-- Editing Mode -->
          <input
            type="text"
            class="form-control me-2"
            bind:value={doc.meta.title}
            placeholder="Enter title"
          />
          <button class="btn btn-primary btn-sm" onclick={saveTitle}>Save</button>
        {:else} 
          <!-- Display Mode -->
          <h5 class="mb-0 me-2">{doc.meta.title}</h5>
          <button class="btn btn-link btn-sm p-0" onclick={toggleTitleEdit} aria-label="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
            </svg>
          </button>
        {/if}
      </div>
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
        {#if mode == "view"}
        <button
        class="btn btn-link btn-sm"
        onclick={() => (edit_mode === "external" ? edit_external() : open_edit())}
      >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
      </svg>
        Edit Doc
      </button>
        {:else}
        
        <button
        class="btn btn-link btn-sm"
        disabled = {edit_mode_data_valid?"":"disabled"}
        onclick={() => (edit_mode === "external" ? edit_external() : edit_internal())}
      >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy" viewBox="0 0 16 16">
        <path d="M11 2H9v3h2z"/>
        <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
      </svg>
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
          {:else if custom_editor_loaded}
            <custom_editor_component.component this={custom_editor_component} mode={"view"} {BBDB}  {doc} {schema}  />
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
            <li class="list-group-item list-group-item-light">
              <div class="p-1"><i>ID</i></div>
              <div class="p-1">{doc._id}</div>
            </li>   
          </div>
        </div>

        

      </div>

    
  {:else if mode === "edit"}
    <div class="row">
      <div class="col-lg-12">
        {#if doc.schema=="schema"}
          <SchemaEditor bind:data={doc.data} schema={schema.schema}  bind:data_valid={edit_mode_data_valid} />
        {:else if custom_editor_loaded}
          <custom_editor_component.component this={custom_editor_component} mode={"edit"} {BBDB}  bind:doc={doc}     {schema}  />
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



