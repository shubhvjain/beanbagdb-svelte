<script>
  import { onMount } from "svelte";
  import {
    emit_bbdb_event
  } from "$lib/bbdb_actions.js";
  import NewDoc from "$lib/core/NewDoc.svelte";
  let { page_bbdb_action, BBDB, page } = $props();
  let new_not_allowed = ["system_log"];
  let loaded = $state(false);
  let loading = $state(true);
  let error = $state(null);

  let schemas = $state([]);
  let selected_schema = $state(null);

  let recent_links = $state([]);
  async function load_schemas(page1) {
    //console.log("loading schemas")
    //console.log(page1)
    let doc = await BBDB.plugins.txtcmd.run(page1);
    //if()
    //console.log(doc);

    return doc;
  }

  onMount(async () => {
    // console.log(page);
    try {
      if (!BBDB) {
        throw new Error(
          "Unable to load page. Component not configured properly"
        );
      }
      console.log(page);

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
    } finally {
      loading = false;
    }
  });

  async function on_bbdb_action(action) {
    console.log(action);
    if (action.name == "new_document") {
      // edit a doc
      console.log("adding a new document ");
      try {
        let data_obj;
        if (action.data.schema == "schema") {
          // generate blank record
          data_obj = {
            name: action.data.data.name,
            title: action.data.data.name,
            description: action.data.data.name,
            active: false,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
              },
            },
            settings: {},
          };
        } else {
          data_obj = action.data.data;
        }
        let update1 = await BBDB.create({
          schema: action.data.schema,
          data: data_obj,
        });
        console.log(update1);
        recent_links.push({ link: update1.meta.link, type: update1.schema });
        return { added: true, error: null };
      } catch (error) {
        console.log(error);
        return { added: false, error: error };
      }
    } else {
      if (page_bbdb_action) {
        return await page_bbdb_action(action);
      }
    }
  }

  function emit_open_page(link) {
    page_bbdb_action(emit_bbdb_event("textcmd", { text: `open/link/${link}` }));
  }

  async function load_schema_new(schema_name) {
    selected_schema = null;
    if (schema_name) {
      console.log(schema_name);
      let schema_doc = await BBDB.get({
        type: "schema",
        criteria: { name: schema_name },
      });
      console.log(schema_doc);
      selected_schema = schema_doc.data;
    }
  }
</script>

<div>
  {#if loading}
    <p>Loading document...</p>
  {:else if error}
    <p class="text-danger">Error: {error}</p>
  {:else if loaded}
    <div class="container-fluid pt-1 mt-2">

      {#if schemas.length>0}
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
      {/if}

      


      {#if selected_schema}
        <div class="row">
          <div class="col-lg-12">
            <NewDoc schema={selected_schema} bbdb_action={on_bbdb_action} />
          </div>
        </div>
        {#if recent_links.length > 0}
          <div class="row">
            <div class="col-lg-12">
              Recently created docs :
              {#each recent_links as rec}
                <button
                  class="btn btn-sm btn-link m-1"
                  onclick={() => emit_open_page(rec.link)}
                >
                  {rec.link} ({rec.type})
                </button>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>
