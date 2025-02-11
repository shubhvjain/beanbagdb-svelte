<script>
  import { onMount } from "svelte";
  import TextBlock from "$lib/utils/TextBlock.svelte";
  import JsBrowserPreview from "$lib/utils/JSBrowserPreview.svelte";
  const script_types = ["js_browser"];
  let {
    schema = {},
    data = $bindable(),
    mode = "view",
    data_valid = $bindable(false),
    new_doc,
    BBDB,
    bbdb_action,
  } = $props();

  let loaded = $state(false);

  onMount(() => {
    loaded = true;
    data_valid = true;
    if(mode=="view"){
      run_script()
    }
  });

  let browser_runnable = $state(false);





  const run_script = () => {
    if (data.type == "js_browser") {
      browser_runnable = true
    } else {
      console.log("This script cannot be run here");
    }
  };
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12 p-0">
      {#if loaded}
        {#if mode == "edit"}
          <div class="mt-3 mb-3">
            <label for="exampleFormControlInput1" class="form-label">Name</label
            >
            <input
              bind:value={data.name}
              type="email"
              class="form-control"
              id="exampleFormControlInput1"
              placeholder="name-no-spaces"
            />
          </div>

          <div class="mt-3">
            <label for="">Script type</label>
            <select
              bind:value={data.type}
              class="form-select"
              aria-label="Default select example"
            >
              {#each script_types as typ}
                <option value={typ}>{typ}</option>
              {/each}
            </select>
          </div>

          <div class="mb-3 mt-3">
            <label for="exampleFormControlTextarea1" class="form-label"
              >Usage</label
            >
            <textarea
              bind:value={data.usage}
              class="form-control"
              id="exampleFormControlTextarea1"
              rows="2"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label"
              >Version</label
            >
            <input
              bind:value={data.version}
              type="number"
              class="form-control"
              id="exampleFormControlInput1"
              placeholder="Script version number"
            />
          </div>

          <div class="form-check">
            <input
              class="form-check-input"
              bind:checked={data.log_execution}
              type="checkbox"
              id="flexCheckDefault"
            />
            <label class="form-check-label" for="flexCheckDefault">
              Log script run (not available for browser scripts)
            </label>
          </div>
          <div class="mb-4 mt-3">
            <label for="exampleFormControlTextarea1" class="form-label"
              >Script</label
            >
            <TextBlock bind:text={data.script} />
            <!-- <textarea bind:value={data.text} class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea> -->
          </div>
        {/if}

        {#if mode == "edit" && data.type == "js_browser"}
          <div class=" mt-4">
            <button onclick={run_script} class="btn btn-sm btn-primary">Run script</button>
          </div>
        {/if}

        <div class="card mb-4">
          <div class="card-body">

            {#if browser_runnable}
              <JsBrowserPreview script={data.script} />
            {:else}
              <pre><code>{data.script}</code></pre>
            {/if}


          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
