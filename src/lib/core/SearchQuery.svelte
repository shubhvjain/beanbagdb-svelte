<script>

  let {on_submit} = $props();


  let jsonInput = $state('{ "schema":"" }');
  let isValidJson = $state(true);

  // Validate JSON
  const validateJson = () => {
    if (jsonInput.trim() === '') {
      isValidJson = false; // Empty input is invalid
      return;
    }
    try {
      JSON.parse(jsonInput);
      isValidJson = true;
    } catch (error) {
      isValidJson = false;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (isValidJson) {
      on_submit({ valid:true, json: JSON.parse(jsonInput) })
    }
  };

  let search_query = [
   
    {
      text:"All schemas",
      query:`{ "schema":"schema"}`,
      complete:true
    },
    {
      text:"All settings",
      query:`{ "schema":"system_setting"}`,
      complete:true
    },
    {
      text:"All logs",
      query:`{ "schema":"system_log"}`,
      complete:true
    },
    {
      text:"All docs",
      query:`{  }`,
      complete:true
    },
    {
      text:"Tag search",
      query:`{ "meta.tags":{"$all":[  ]} }`,
      complete:false
    }
  ]
  let add_query = (query)=>jsonInput = query
</script>

<div class="container mt-4">
  <div class="mb-3">
    <label for="jsonInput" class="form-label">Enter JSON:</label>
    <textarea
      id="jsonInput"
      class="form-control {isValidJson ? 'is-valid' : 'is-invalid'}"
      rows="6"
      bind:value={jsonInput}
      onblur={validateJson}
      placeholder="Enter JSON here..."
    ></textarea>
    <div class="invalid-feedback">Invalid JSON. Please check your input.</div>
    <div class="valid-feedback">Valid JSON.</div>
    Search for : {#each search_query as q}
      <button class="btn btn-sm btn-link" onclick={()=>{add_query(q.query);if(q.complete){  handleSearch() }  }}>{q.text}</button>
    {/each}
  </div>
  <button class="btn btn-primary" onclick={handleSearch} disabled={!isValidJson}>
    Search
  </button>
</div>

<style>
  textarea {
    transition: border-color 0.3s, box-shadow 0.3s;
  }
</style>
