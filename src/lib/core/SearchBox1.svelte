<script>
  import { onMount } from "svelte";

  let {  on_selection_changed, search_query = "", BBDB, max_selection=1, bbdb_action, on_load_select_first=false  } = $props();
  import { emit_bbdb_event } from "$lib/bbdb_actions.js";
import SearchScript from "$lib/utils/SearchScript.svelte";
  let loaded = $state(false);
  let unloaded_message = $state("")
  let results = $state([]);
  let isFocused = $state(false) // Track focus state of the input field
  onMount(async() => {
    if(!bbdb_action){
      bbdb_action= ()=>{}
    }
    if (!BBDB) {
      loaded = false;
      unloaded_message = "Invalid component config";
      return;
    }

    if(on_load_select_first){
      await searchDocuments()
      select_first_item()
    }
    loaded = true;
  });

  const select_first_item = () => {
    if(results.length>0){
      let doc0 = results[0]
      selected.push({title:doc0.meta.title,link:doc0.meta.link,id:doc0._id})
    }
  }

  const on_select_emit = (doc)=>{
    bbdb_action(emit_bbdb_event("load_this_node",{id:doc._id,link:doc.meta.link,title:doc.meta.title}))
  }

  // Search function
  async function searchDocuments() {
    if (!search_query.trim()) {
      results = [];
      return;
    }
    try {
      let search  =  await BBDB.apps["txtcmd"].parse(`search/filter?${search_query.trim()}`);
      // console.log(search)
      if(search.valid){
        let look = await  BBDB.apps["txtcmd"].run(search)
        results = look.result.docs
        isFocused = true
      }
    } catch (error) {
      console.error("Search failed:", error);
      results = [];
    }
  }
  async function handle_script(q){
    //console.log(q)
    try {
      let search  =  await BBDB.search({"selector":q});
      console.log(search)
      results = search.docs||[]
      isFocused = true
      // console.log(search)
     
    } catch (error) {
      console.error("Search failed:", error);
      results = [];
    }
  }

    // Handle focus state
    function handleFocus() {
    isFocused = true;
  }



</script>

<div class="container-fluid">
{#if loaded}
   
    <div class="row mb-2 mt-2 g-3 align-items-center">
      <div class="row ">
        <div class="col-lg-12">
          <div class="input-group">
            <input type="text" class="form-control"  aria-label="Input"  bind:value={search_query}
            oninput={searchDocuments}
            placeholder="Search documents..."  
            onfocus={handleFocus}>
  
            <button onclick={searchDocuments} class="btn btn-outline-secondary" type="button">   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg> </button>
            <button  onclick={()=>{isFocused=false}}  class="btn btn-outline-secondary" type="button"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg></button>
          </div>
          
          <SearchScript {BBDB} on_return_query={handle_script}/>

        </div>
      </div>
     
    </div>


    <div class="row">
      <div class="col-lg-12">
        {#if isFocused && results.length > 0}
          <div class="list-group list-group-flush mt-1 overflow-auto" style="border-radius: 0px;"  >
            {#each results as doc}
              <div class="list-group-item p-0 mt-1">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold">{doc.meta.title}</div>
                    <i class="text-secondary ">{doc.meta.link}</i>  <i class="text-secondary ">: {doc.schema}</i>
                  </div>
                  <button class="btn btn-sm btn-link" onclick={() => on_select_emit(doc)}>Select</button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
{:else}
  <p>{unloaded_message}</p>
{/if}

</div>