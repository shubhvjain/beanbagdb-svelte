<script>
  import { onMount } from "svelte";
  import MermaidChart from "../utils/Mermaid.svelte";
  import { emit_bbdb_event } from "../bbdb_actions.js";
  import SearchBox from "../core/SearchBox.svelte";


  let {
    data = $bindable(),
    schema = {},
    mode = "edit",
    new_doc,
    BBDB,
    bbdb_action,
    data_valid = $bindable(false),
  } = $props();

  let loaded = $state(false);


  let view_chart = $state(``);
  let view_data = $state({});





  function on_bbdb_action(data) {
    if (bbdb_action) {
      bbdb_action(data);
    }
    console.log(data);
  }

  const validate_data= ()=>{
    data_valid = true
  }

  const load_nodes = async () => {
    if (BBDB) {
      let n1 = await BBDB.read({_id:data.node1})
      console.log(n1)
      view_data.node1 = n1.doc
      view_data.node1_query = `id=${data.node1}`
      let n2 = await BBDB.read({_id:data.node2})
      view_data.node2_query = `id=${data.node2}`
      console.log(n2)
      view_data.node2 = n2.doc
      console.log(view_data)

      view_chart = `flowchart LR
A[${view_data.node1.meta.title}]--${data.edge_name}---B[${view_data.node2.meta.title}]`
    }
  };

  onMount(async () => {
    if (new_doc==false) {
      await load_nodes()
    }
    loaded = true;
  });

  const on_node1_select = (sel) => {
    console.log(sel);
    data.node1 = {_id:sel[0]["id"]};
    validate_data()
  };

  const on_node2_select = (sel) => {
    console.log(sel);
    data.node2 = {"_id":sel[0]["id"]};
    validate_data()
  };


</script>

{#if loaded}
  {#if mode == "view"}
  <div class="p-3">
    <MermaidChart diagram={view_chart} />
  </div>
   
  {:else if mode == "edit"}
    <div class="row">
      <div class="col-lg-12">
        <h5>Select Node 1</h5>
        <SearchBox
          {BBDB}
          search_query={view_data.node1_query||""}
          on_selection_changed={on_node1_select}
          on_load_select_first={!new_doc}
          bbdb_action={on_bbdb_action}
        />
      </div>
      <div class="col-lg-12">
        <h5>Select Edge type</h5>
        <input
          bind:value={data.edge_name}
          type="test"
          class="form-control"
          id="edgelabel"
          placeholder="Label the edge"
          onblur={validate_data}
        />
      </div>
      <div class="col-lg-12">
        <h5>Select Node 2</h5>
        <SearchBox
          {BBDB}
          search_query={view_data.node2_query||""}
          on_selection_changed={on_node2_select}
          on_load_select_first={!new_doc}
          bbdb_action={on_bbdb_action}
        />
      </div>
    </div>
    <div class="col-lg-12">
      <label for="exampleFormControlTextarea1" class="form-label">Note</label>
      <textarea
        bind:value={data.note}
        class="form-control"
        id="exampleFormControlTextarea1"
        rows="2"
        onblur={validate_data}
      ></textarea>
    </div>
  {/if}
{/if}
