<script>

  import { onMount } from "svelte";
  let {schema,data}  = $props()
  import { emit_bbdb_event, get_schema_schema } from "$lib/bbdb_actions.js";
  import JsonEditor from "./JSONEditor.svelte";
  
  let loaded = $state(false);

  let temp_schema_string = $state("")

  let partial_schema = $state({})
  let partial_data = $state({})


  const load_editor = ()=>{
    loaded = false
    partial_schema = {...schema}
    partial_data = {...data}
    temp_schema_string  = JSON.stringify(data["schema"],null,2)
    let fields_to_delete = ["schema","system_generated","version"]
    fields_to_delete.map(field=>{
      delete partial_schema["properties"][field]
      delete partial_data[field]
    })
    partial_schema["required"] = partial_schema["required"].filter(item=>!fields_to_delete.includes(item))
    
    //console.log(partial_schema)
    //console.log(partial_data)
    //console.log(temp_schema_string)
    loaded = true
    
  } 

  onMount(()=>{
    console.log(data)
    load_editor()
  })
</script>

{#if loaded}
<details>
  <summary>Details</summary>
  <JsonEditor bind:data={partial_data} schema={partial_schema}  />
</details>
<details>
  <summary>Schema</summary>
  <textarea  class="form-control"  name="scehma_editor" bind:value={temp_schema_string} rows="10"></textarea>
</details>
{/if}