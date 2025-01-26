<script>

  import { onMount } from "svelte";
  let {schema,data= $bindable(),data_valid = $bindable()}  = $props()
  import { emit_bbdb_event, get_schema_schema } from "$lib/bbdb_actions.js";
  
import RawJsonEditor from "./RawJSONEditor.svelte";
  
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
<RawJsonEditor data={data}  handle_change={on_data_change} />
<br>
<dic class="card">
  <div class="card-body">
    Form Preview  
  </div>
</dic>
{/if}