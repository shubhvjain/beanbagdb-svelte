<script>
  import { onMount } from "svelte";
  let {
    schema = {},
    data = $bindable(),
    mode = "view",
    data_valid = $bindable(false),
    new_doc,
    BBDB,
    bbdb_action,
    options={}
  } = $props();

  import { emit_bbdb_event, get_schema_schema } from "$lib/bbdb_actions.js";

  import ObjectViewer2 from "../utils/ObjectViewer2.svelte";
  import JsonEditor from "../utils/JSONEditor.svelte";

  let loaded = $state(false);

  let system_settings = {
   
  };

  const on_data_change = (d) => {
    console.log(d);
    data_valid = d.valid;
    if (d.valid) {
      data = d.data;
      console.log(data);
    }
  };

  onMount(() => {
    //console.log(data);
    //console.log(options)
    if (system_settings[data.name]) {
      console.log(schema);
      schema = system_settings[data.name]["schema"];
      console.log(schema);
      if(Object.keys(data.value).length==0){
        data.value = system_settings[data.name]["default_value"]
      }
    }else if(options?.setting_schema[data.name]){
      schema =  options.setting_schema[data.name]
      console.log(schema);
    }
    loaded = true;
  });
</script>

{#if loaded}
  {#if mode == "view"}
    <div class="pt-2">
     
      {#if data.name == "graph_icons"}
        <ol>
          {#each Object.keys(data.value) as icn }
            <li> <code>{icn}</code> :  {@html data.value[icn]}  </li>
          {/each}
        </ol>
        
      {:else}
        <ObjectViewer2 {data} />
      {/if}
    </div>
  {:else if mode == "edit"}
    <JsonEditor bind:data {schema} editor_options={{disable_properties:false}} bind:data_valid />
  {/if}
{/if}
