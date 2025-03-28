<script>
  import { onMount } from "svelte";
  import { emit_bbdb_event } from "$lib/bbdb_actions.js";
  import Doc from "$lib/core/Doc.svelte";
  let { page_bbdb_action, BBDB, page, excluded_schemas = [],custom_editors={} , show_history=true,custom_app_editors,setting_schemas} = $props();
  let loaded = $state(false);
  let loading = $state(true);
  let error = $state(null);
  let schemas = $state([]);
  let history = $state([])
  let selected_schema = $state(null);
  async function load_schemas(page1) {
    let doc = await BBDB.apps.txtcmd.run(page1);
    return doc;
  }
  function sortByDataName(arr) {return arr.sort((a, b) => a.title.localeCompare(b.title))}

  onMount(async () => {
    // console.log(page);
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }

      if (!page) {
        try {
          let run_cmd = await BBDB.apps.txtcmd.parse_and_run("new");
          if (run_cmd.valid) {
            schemas = run_cmd.result;
            schemas = sortByDataName(schemas)
            if (schemas.length == 1) {
              // auto select the first
            }

            if(excluded_schemas.length>0){
              schemas = schemas.filter(item => !excluded_schemas.includes(item.name));
            }

            loaded = true;
          } else {
            loaded = false;
            error = run_cmd.errors.join(",");
          }
        } catch (error) {
          console.log(error);
        }
      }

      if (page.criteria.schema != "") {
        try {
          await load_schema_new(page.criteria.schema)
          loaded = true;   
        } catch (error) {
          console.log(error)
          error = error.message
          loaded = false
        }
      } else {
        let run_cmd = await load_schemas(page);
        if (run_cmd.valid) {
          schemas = run_cmd.result;
          schemas = sortByDataName(schemas)
          if (schemas.length == 1) {
            // auto select the first
          }
          loaded = true;
        } else {
          loaded = false;
          error = run_cmd.errors.join(",");
        }
      }
    } catch (err) {
      error = err.message;
    }
  });

  async function on_bbdb_action(action) {
    console.log(action);
    if(action.name=="new_document_created" && show_history){
      history.push(action.data.link)
    }
    if (page_bbdb_action) {
      return await page_bbdb_action(action);
    }
  }

  function emit_open_page(link) {
    if(!page_bbdb_action) return 
    page_bbdb_action(emit_bbdb_event("textcmd", { text: `open/link/${link}` }));
  }

  async function load_schema_new(schema_name) {
    selected_schema = null;
    setTimeout(() => {
      selected_schema = schema_name;
    }, 50);
  }
</script>

<div>
  {#if loaded}
    <div class="container-fluid pt-1 mt-2">
      {#if schemas.length > 0}
        <select
          class="form-select form-select-lg mb-3"
          aria-label="select schema"
          onchange={(e) => {
            load_schema_new(e.target.value);
          }}
        >
          <option value="" selected>Select schema</option>
          {#each schemas as sch}
            <option value={sch.name}>{sch.title}</option>
          {/each}
        </select>
        
<div class="row mb-2">
  <div class="col-lg-12">
    <details>
      <summary>Or Select</summary>
      <div class="scroll-container border p-1">
        {#each schemas as sch}
        <button class="btn btn-secondary m-1" onclick={()=>{load_schema_new(sch.name)}}  >{sch.title}</button>
      {/each}
        </div>
    </details>
  </div>
</div>
      {/if}

      {#if selected_schema}
        <div class="row">
          <div class="col-lg-12">
            <Doc
              {BBDB}
              bbdb_action={on_bbdb_action}
              new_doc={true}
              schema_name={selected_schema}
              {custom_editors}
              {custom_app_editors}
              {setting_schemas}
            />
            <!-- <NewDoc schema={selected_schema} bbdb_action={on_bbdb_action} /> -->
          </div>
        </div>


        {#if show_history}
        {#if history.length > 0}
        <div class="row">
          <div class="col-lg-12">
            Recently created docs :
            {#each history as rec}
              <button
                class="btn btn-sm btn-link m-1"
                onclick={() => emit_open_page(rec)}
              >
                {rec}
              </button>
            {/each}
          </div>
        </div>
      {/if}
        {/if}

      {/if}

    

    </div>
  {:else}
    <p>Loading document...</p>
  {/if}
</div>
<style>
  .scroll-container {
            height: 65px; /* Fixed height */
            overflow-x: auto;
            white-space: nowrap;
        }
</style>