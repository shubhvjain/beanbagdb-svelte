<script>
  import { onMount } from "svelte";
  import { copy_to_clipboard,format_timestamp, emit_bbdb_event } from "$lib/bbdb_actions.js";
  import Doc from "$lib/core/Doc.svelte";
  import NewDoc from "$lib/core/NewDoc.svelte";
  let { page_bbdb_action, BBDB, page } = $props();
  let new_not_allowed = ["system_log"]
  let loaded = $state(false);
  let loading = $state(true);
  let error = $state(null);

  let schemas = $state([])
  let selected_schema = $state(null)
  async function load_schemas(page1) {
    console.log(page1)
    let doc = await BBDB.plugins.txtcmd.run(page1);
    //if()
    console.log(doc);

    return doc;
  }

  onMount(async () => {
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      console.log(page);
      let run_cmd  =  await load_schemas(page);
      if (run_cmd.valid){
        schemas = run_cmd.result
        if(schemas.length==1){
          // auto select the first 
        }
        loaded = true;
      }else{
        loaded = false
        error = run_cmd.errors.join(",")
      }
      
      
      
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function on_bbdb_action(action) {
    console.log(action)
    if(action.name=="new_document"){
      // edit a doc
      console.log("adding a new document ")
      try {
        let update1 = await BBDB.create(action.data.schema,action.data.data) 
        console.log(update1)     
        return {added:true,error:null}
      } catch (error) {
        console.log(error)
        return {added:false,error:error}
      }
    }else{
      if (page_bbdb_action) {
        return await page_bbdb_action(action);
      }
    }
  }

  async function load_schema_new(schema_name){
    selected_schema=null
    if(schema_name){
      console.log(schema_name)
      let schema_doc = await BBDB.get("schema",{name:schema_name}) 
      console.log(schema_doc)
      selected_schema = schema_doc.data
    }
  }
</script>

<div>
  {#if loading}
    <p>Loading document...</p>
  {:else if error}
    <p class="text-danger">Error: {error}</p>
  {:else if loaded}
  <div class="container-fluid pt-1 mt-2">
    <select class="form-select form-select-lg mb-3" aria-label="select schema" 
    onchange={(e) => {load_schema_new(e.target.value) }}>
      <option value="" selected>Select schema</option>
      {#each schemas as sch }
      <option value={sch.name}>{sch.name}</option>  
      {/each}
    </select>
    {#if selected_schema}
    <div class="row">
      <div class="col-lg-12">

        <NewDoc schema={selected_schema} bbdb_action={on_bbdb_action}/>

      </div>
    </div>  
    {/if}
    
  </div>
  
   
  {/if}
</div>
