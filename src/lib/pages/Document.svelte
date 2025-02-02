<script>
  import { onMount } from "svelte";
  import {  emit_bbdb_event } from "$lib/bbdb_actions.js";
  import Doc from "$lib/core/Doc.svelte";
  let { page_bbdb_action, BBDB, page,custom_editors } = $props();
  let loaded = $state(false);
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
      console.log(page)
      loaded = true
    } catch (err) {
      error = err.message;
      loaded =false
    } 
  });

  async function on_bbdb_action(action) {
    console.log(action)
    if(action.name=="edit_partial_meta"){
      // edit a doc
      console.log("saving changes")
      try {
        let update1 = await BBDB.update({ 
          criteria: {link:action.data.link}, 
          updates: action.data.update ,
          rev_id: action.data.rev
        }) 
        console.log(update1)     
        return {update:true,error:null}
      } catch (error) {
        console.log(error)
        return {update:false,error:error}
      }


    }
    else if(action.name=="update_doc_data"){
      // edit a doc
      console.log("saving changes")
      try {
        let update1 = await BBDB.update({ 
          criteria: {link:action.data.link}, 
          updates: action.data ,
          rev_id: action.data.rev
        }) 
        console.log(update1)     
        page_bbdb_action(emit_bbdb_event("show_ui_message",{message:"Saved",type:"success"}))
        return {update:true,error:null}
      } catch (error) {
        console.log(error)
        page_bbdb_action(emit_bbdb_event("show_ui_message",{message:"Error in saving: "+error.message,type:"error"}))
        return {update:false,error:error}
      }

      
    }
    else{
      if (page_bbdb_action) {
        return await page_bbdb_action(action);
      }
    }
    
  }
</script>

<div>
  {#if loaded==false}
    <p>Loading document...</p>
  {#if error}
    <p class="text-danger">{error}</p>
  {/if}

  {:else if loaded ==true}
  <div class="container-fluid">
    <Doc   bbdb_action={on_bbdb_action}  custom_editors={custom_editors}  {BBDB}  doc_key={page.criteria}  />
  </div>
  {/if}
</div>
