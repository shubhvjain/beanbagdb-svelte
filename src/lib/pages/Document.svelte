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
    try {
      let doc = await BBDB.plugins.txtcmd.run(page1);
    console.log(doc);
    return doc ;   
    } catch (error) {
      throw error
    }
   
  }


  onMount(async () => {
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      // console.log(page);
      let fetch_data =  await load_doc(page);
      if(fetch_data.valid){
        documentData = fetch_data.result
        loaded = true;
      }else{
        loaded = false;
        error = fetch_data.errors.join(",")
      }
      
    } catch (err) {
      error = err.message;
      loaded =false
    } finally {
      loading = false;
    }
  });

  async function on_bbdb_action(action) {
    console.log(action)
    if(action.name=="edit_partial_meta"){
      // edit a doc
      console.log("saving changes")
      try {
        let update1 = await BBDB.update({link:action.data.link},  action.data.update ,action.data.rev) 
        console.log(update1)     
        return {update:true,error:null}
      } catch (error) {
        console.log(error)
        return {update:false,error:error}
      }
    }else{
      if (page_bbdb_action) {
        return await page_bbdb_action(action);
      }
    }
    
  }
</script>

<div>
  {#if loading}
    <p>Loading document...</p>
  {:else if error}
    <p class="text-danger">{error}</p>
  {:else if loaded && documentData}
  <div class="container-fluid">
    <Doc doc={documentData.doc} schema={documentData.schema}  bbdb_action={on_bbdb_action} editable={true}/>
  </div>
   
  {/if}
</div>
