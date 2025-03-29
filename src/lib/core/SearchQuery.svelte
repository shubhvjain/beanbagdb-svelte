<script>
  import { onMount } from "svelte";

  import SearchScript from "$lib/utils/SearchScript.svelte";
  let {on_submit,BBDB} = $props();


  let jsonInput = $state('{ "schema":"" }');
  let isValidJson = $state(true);
  let schemas = $state([]);

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
      text:"Schemas",
      query:`{ "schema":"schema"}`,
      complete:true
    },
    {
      text:"Settings",
      query:`{ "schema":"system_setting"}`,
      complete:true
    },
    {
      text:"Keys",
      query:`{ "schema":"system_key"}`,
      complete:true
    },
    {
      text:"Graph edge constraints",
      query:`{ "schema":"system_edge_constraint"}`,
      complete:true
    },
    {
      text:"Graph edges",
      query:`{ "schema":"system_edge"}`,
      complete:true
    },
    {
      text:"Logs",
      query:`{ "schema":"system_log"}`,
      complete:true
    },
    {
      text:"All Docs",
      query:`{  }`,
      complete:true
    }
  ]
  let add_query = (query)=>jsonInput = query

  const fieldMappings = { 
    "schema": "schema" ,
    "link":"meta.link",
    "id":"_id",
    "_id":"_id",
    "title": "meta.title",
    "tags":"meta.tags",
    "created_on":"meta.created_on",
    "created":"meta.created_on",
    "updated":"meta.updated_on",
    "updated_on":"meta.updated_on",
  };
  const dateFields = ['created', 'updated','created_on','updated_on'];

  let conditions = $state([{ field: '', operator: '', value: '', valueEnd: '' }])
  let generatedQuery = $state('');

  const operators = {
    'equals': '$eq',
    'not equals': '$ne',
    'greater than': '$gt',
    'less than': '$lt',
    'greater than or equal': '$gte',
    'less than or equal': '$lte',
    'in': '$in',
    'not in': '$nin'
  };

  function addCondition() {
    conditions = [...conditions, { field: '', operator: '', value: '', valueEnd: '' }];
  }

  function removeCondition(index) {
    conditions = conditions.filter((_, i) => i !== index);
  }

  function setDateRange(condition, range) {
    const now = new Date();
    if (range === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      condition.value = startOfDay.toISOString().slice(0, 16);
      condition.valueEnd = endOfDay.toISOString().slice(0, 16);
    } else if (range === 'this_week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date();
      endOfWeek.setHours(23, 59, 59, 999);
      condition.value = startOfWeek.toISOString().slice(0, 16);
      condition.valueEnd = endOfWeek.toISOString().slice(0, 16);
    } else if (range === 'last_3_days') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      condition.value = threeDaysAgo.toISOString().slice(0, 16);
      condition.valueEnd = endOfToday.toISOString().slice(0, 16);
    } else if (range === 'last_6_hours') {
      const sixHoursAgo = new Date(now - 6 * 60 * 60 * 1000);
      condition.value = sixHoursAgo.toISOString().slice(0, 16);
      condition.valueEnd = now.toISOString().slice(0, 16);
    } else if (range === 'last_3_hours') {
      const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000);
      condition.value = threeHoursAgo.toISOString().slice(0, 16);
      condition.valueEnd = now.toISOString().slice(0, 16);
    }
  }


  function generateQuery() {
    let selector = {};
    conditions.forEach(({ field, operator, value, valueEnd }) => {
      if (field && operator && value) {
        let formattedValue = value;
        if (dateFields.includes(field)) {
          if (operator === 'in') {
            formattedValue = [Math.floor(new Date(value).getTime() / 1000), Math.floor(new Date(valueEnd).getTime() / 1000)];
          } else {
            formattedValue = Math.floor(new Date(value).getTime() / 1000);
          }
        } else if (operator === 'in' || operator === 'not in') {
          formattedValue = value.split(',').map(v => v.trim());
        } else {
          formattedValue = isNaN(value) ? value : Number(value);
        }
        let mappedField = fieldMappings[field] || `data.${field}`;
        selector[mappedField] = { [operators[operator]]: formattedValue };
      }
    });
    generatedQuery = JSON.stringify( selector , null, 2);
    console.log(generatedQuery)
    jsonInput = generatedQuery
    handleSearch()
  }
  async function load_schemas(){
    try {
          let run_cmd = await BBDB.apps.util.parse_and_run_text_command("new");
          schemas = run_cmd.result;
        } catch (error) {
          console.log(error);
        }
  }
  function run_search_script_query(q){
    console.log(q)
    on_submit({ valid:true, json: q })
  }
  onMount(async()=>{
    await load_schemas()
  })


</script>

<div class="container mt-4 mb-4">

    <!-- <textarea class="form-control mb-3" bind:value={inputQuery} placeholder="Paste JSON query here"></textarea> -->
    <!-- <button class="btn btn-primary mb-3" on:click={parseQuery}>Parse Query</button> -->
    

    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="pills-disabled-tab" data-bs-toggle="pill" data-bs-target="#pills-disabled" type="button" role="tab" aria-controls="pills-disabled" aria-selected="true">Common</button>
      </li>
    
      <li class="nav-item" role="presentation">
        <button class="nav-link " id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="false">Form</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">JSON</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Search scripts</button>
      </li>
    
    </ul>
    <div class="tab-content" id="pills-tabContent">
      <div class="tab-pane fade show active" id="pills-disabled" role="tabpanel" aria-labelledby="pills-disabled-tab" tabindex="0">
        
        {#each search_query as q}
          <button type="button" onclick={()=>{add_query(q.query);if(q.complete){  handleSearch() }  }} class="btn btn-sm btn-secondary m-1">{q.text}</button>
        {/each}
        <details>
          <summary>Schemas</summary>
          <div class="scroll-container border p-1">
            {#each schemas as sch}
            <button class="btn btn-secondary btn-sm m-1" onclick={()=>{add_query(`{"schema":"${sch.name}"}`); handleSearch() }}  >{sch.title}</button>
          {/each}
            </div>
        </details>
      </div>
      <div class="tab-pane fade " id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">
        
        
        {#each conditions as condition, index}
    <div class="row g-2 align-items-center mb-2">
      <div class="col">
        <input type="text" class="form-control" bind:value={condition.field} placeholder="Field" />
      </div>
      <div class="col">
        <select class="form-select" bind:value={condition.operator}>
          {#each Object.keys(operators) as op}
            <option value={op}>{op}</option>
          {/each}
        </select>
      </div>
      <div class="col">
        {#if dateFields.includes(condition.field) && condition.operator === 'in'}
          <input type="datetime-local" class="form-control" bind:value={condition.value} />
          <input type="datetime-local" class="form-control mt-2" bind:value={condition.valueEnd} />
          <div class="btn-group mt-2">
            <button class="btn btn-link" onclick={() => setDateRange(condition, 'today')}>Today</button>
            <button class="btn btn-link" onclick={() => setDateRange(condition, 'this_week')}>This Week</button><br>
            <button class="btn btn-link" onclick={() => setDateRange(condition, 'last_3_days')}>Last 3 Days</button>
            <button class="btn btn-link" onclick={() => setDateRange(condition, 'last_6_hours')}>Last 6 Hours</button>
            <button class="btn btn-link" onclick={() => setDateRange(condition, 'last_3_hours')}>Last 3 Hours</button>
          </div>
        {:else if dateFields.includes(condition.field)}
          <input type="datetime-local" class="form-control" bind:value={condition.value} />
        {:else}
          <input type="text" class="form-control" bind:value={condition.value} placeholder="Value" />
        {/if}
      </div>
      <div class="col-auto">
        <button class="btn btn-danger" onclick={() => removeCondition(index)}>Remove</button>
      </div>
    </div>
    
  {/each}
    <hr>    
       
      <button class="btn btn-success me-2" onclick={addCondition}>Add Condition</button>
      <button class="btn btn-warning" onclick={generateQuery}>Search</button>
      </div>
      <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">
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
        <button class="btn btn-primary" onclick={handleSearch} disabled={!isValidJson}>
          Search
        </button>
      </div>
      <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab" tabindex="0">
       <SearchScript {BBDB} on_return_query={run_search_script_query}  />
      </div>
       </div>
</div>

<style>
  textarea {
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .scroll-container {
            height: 65px; /* Fixed height */
            overflow-x: auto;
            white-space: nowrap;
        }
</style>
