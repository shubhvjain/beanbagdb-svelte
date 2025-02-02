<script>
  import { onMount } from "svelte";
  import MermaidChart from "../utils/Mermaid.svelte";
  import { emit_bbdb_event, load_editor } from "../bbdb_actions.js";
  import SearchBox from "../core/SearchBox.svelte";

  function on_bbdb_action(data) {
    // if (page_bbdb_action) {
    //   page_bbdb_action(data);
    // } else {
    //   console.log(data);
    // }
    if(bbdb_action){
      bbdb_action(data)
    }
    
    console.log(data)
  }

  let { doc = {}, schema = {}, mode = "view", BBDB, bbdb_action } = $props();
  let loaded = $state(false);
  let data = $state({});
  
  let new_doc = $state(false)
  let blank_data = $state({})
  let view_chart = $state(``)
  let diag = `
    flowchart LR
    A-- This is the text! ---B`;
  let view_data  = $state({})


  onMount(async () => {
    let opt = load_editor({ doc, schema, mode });
    new_doc = opt.new_doc
    blank_data = opt.blank_data
    if (new_doc) {
      data = {...blank_data};
      mode = "edit";
    } else {
      data = doc.data;
    }

    if(!new_doc){

    }

    loaded = true;
  });

  const on_node1_select = (sel)=>{
    console.log(sel)
    data.node1 = sel[0]["id"]
  }

  const on_node2_select = (sel)=>{
    console.log(sel)
    data.node2 = sel[0]["id"]
  }

</script>

{#if loaded}

{#if mode == "view"}
  <MermaidChart diagram={diag} />

{:else if mode == "edit"}
  
<div class="row">
  <div class="col-lg-4">
    <h5>Select Node 1</h5>
    <SearchBox  {BBDB}  on_selection_changed={on_node1_select}  on_load_select_first={!new_doc} bbdb_action={on_bbdb_action}   />

  </div>
  <div class="col-lg-4">
    <h5>Select Edge type</h5>
    <input bind:value={data.edge_name} type="test" class="form-control" id="edgelabel" placeholder="Label the edge">

  </div>
  <div class="col-lg-4">
    <h5>Select Node 2</h5>
    <SearchBox  {BBDB}  on_selection_changed={on_node2_select} on_load_select_first={!new_doc} bbdb_action={on_bbdb_action}   />

  </div>
</div>
<div class="col-lg-12">
  <label for="exampleFormControlTextarea1" class="form-label">Note</label>
  <textarea bind:value={data.note} class="form-control" id="exampleFormControlTextarea1" rows="2"></textarea>

</div>

<button class="btn" onclick={()=>{console.log(data)}} >Data</button>

{/if}

{/if}