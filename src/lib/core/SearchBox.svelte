<script>
  import { onMount } from "svelte";

  let { selected = [], on_selection_changed, search_query = "", BBDB, max_selection=1, bbdb_action, on_load_select_first=false} = $props();
  import { emit_bbdb_event } from "$lib/bbdb_actions.js";
  import Page from "../../routes/+page.svelte";

  let loaded = $state(false);
  let unloaded_message = $state("")
  let results = $state([]);
  let isFocused = $state(false) // Track focus state of the input field
  onMount(async() => {
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

  // Search function
  async function searchDocuments() {
    if (!search_query.trim()) {
      results = [];
      return;
    }
    try {
      let search  =  await BBDB.plugins["txtcmd"].parse(`search/filter?${search_query}`);
      console.log(search)
      if(search.valid){
        let look = await  BBDB.plugins["txtcmd"].run(search)
        results = look.result.docs
        isFocused = true
      }
    } catch (error) {
      console.error("Search failed:", error);
      results = [];
    }
  }

  // Add selected document
  function selectDocument(doc) {
    if(selected.length < max_selection){
      if (!selected.find(doc1=>doc1.id==doc._id)) {
        selected = [...selected, {id:doc._id,link:doc.meta.link,title:doc.meta.title}]; // Add to selected
        if(on_selection_changed){
          on_selection_changed(selected); // Notify parent
        }
      }else{
        bbdb_action(emit_bbdb_event("show_ui_message",{message:`This is already selected`}))

      }
    }else{
      console.log("max selection limit reached")
      if(bbdb_action){
        bbdb_action(emit_bbdb_event("show_ui_message",{message:`You can only select ${max_selection} doc`}))
      }
    }



    // search_query = ""; // Clear search box
    // results = []; // Hide dropdown
  }

  // Remove selected document
  function removeDocument(doc) {
    selected = selected.filter(d => d.id !== doc.id);
    if(on_selection_changed)
      on_selection_changed(selected);
  }

    // Handle focus state
    function handleFocus() {
    isFocused = true;
  }

  function handleBlur1() {
    isFocused = false;
  }

  function handleBlur() {
    // Set a small timeout to allow clicks on the dropdown before it closes
    setTimeout(() => {
      if(selected.length < max_selection){
        isFocused = true;
      }else{
        isFocused = false
      }
    }, 200); // Adjust timeout as necessary
  }
</script>

{#if loaded}
  <div class="position-relative">
    <!-- Selected Documents as Tags -->
    {#if selected.length > 0}
      <div class="mb-2 d-flex flex-wrap gap-2">
        {#each selected as doc}
          <span class="badge bg-primary d-flex align-items-center p-2">
              <p>{doc.title} <i>[{doc.link}]</i></p>
            <button class="btn-close ms-2" onclick={() => removeDocument(doc)}></button>
          </span>
        {/each}
      </div>
    {/if}

    <!-- Search Input -->
    <div class="input-group mb-3">
      <input type="text" class="form-control"  aria-label="Recipient's username" aria-describedby="button-addon2" bind:value={search_query}
      oninput={searchDocuments}
      placeholder="Search documents..."  
      onfocus={handleFocus}
      >
      <button onclick={searchDocuments} class="btn btn-outline-secondary" type="button" id="button-addon2"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
        </svg>  
      </button>
      <button onclick={()=>{isFocused=false}} class="btn btn-outline-secondary" type="button" id="button-addon2"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg> </button>
    </div>
    

    <!-- Dropdown Results -->
    {#if isFocused && results.length > 0}
      <ul class="list-group position-absolute w-100 mt-1 shadow" style="z-index: 1000;">
        {#each results as doc}
          <li class="list-group-item d-flex justify-content-between align-items-start"
            
          >
            <div class="ms-2 me-auto">
              <div class="fw-bold">{doc.meta.title}</div>
              <i>{doc.meta.link} </i> <i>{doc.schema}</i>
            </div>
            <span class=" text-bg-primary">
              
              <button class="btn btn-sm" onclick={() => selectDocument(doc)}>Select</button>
            </span>
          </li>

          
        {/each}
      </ul>
    {/if}
  </div>
{:else}
  <p>{unloaded_message}</p>
{/if}
