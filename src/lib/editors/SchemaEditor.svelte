<script>

  import { onMount } from "svelte";
  let {schema={},data= $bindable(),mode="view",data_valid = $bindable(false),new_doc,BBDB,bbdb_action}  = $props()

  import { emit_bbdb_event, get_schema_schema } from "$lib/bbdb_actions.js";
  
import RawJsonEditor from "../utils/RawJSONEditor.svelte";
import ObjectViewer2 from "../utils/ObjectViewer2.svelte";

  let loaded = $state(false);

  const on_data_change = (d)=>{
    console.log(d)
    data_valid = d.valid
    if(d.valid){
      data = d.data
      console.log(data)
    }
    
  }

  onMount(()=>{

    console.log(data)
    loaded = true
  })
</script>

{#if loaded}

{#if mode=="view"}
<div class="pt-2">
  <ObjectViewer2 data={data} />
</div>

{:else if mode =="edit"}
<RawJsonEditor data={data}  handle_change={on_data_change} />
<br>
<dic class="card">
  <div class="card-body">
    Form Preview  
  </div>
</dic>

{/if}




{/if}