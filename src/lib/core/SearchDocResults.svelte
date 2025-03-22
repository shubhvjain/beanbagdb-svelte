<script>
  import { onMount } from "svelte";
  let {docs,selectionType="no",bbdb_action} = $props() 
  import { writable } from "svelte/store";

  import {emit_bbdb_event,copy_to_clipboard} from "$lib/bbdb_actions.js"

  // openLink

  //*** this part is for record selection *//

  let selectedDoc = null; // single selection
  let selectedDocs = []; // multiple selection
  let selectedJSON = $state(null);
  const dispatch = (type,data)=>{
    bbdb_action(emit_bbdb_event(type,data))
  }
  function handleSelection(docLink) {
    selectedDoc = docLink;
  }

  function handleMultiSelection(docLink, isChecked) {
    if (isChecked) {
      selectedDocs = [...selectedDocs, docLink];
    } else {
      selectedDocs = selectedDocs.filter((link) => link !== docLink);
    }
  }

  function submitSelectedRecord() {
    if (selectionType === "single") {
      dispatch("selectedRecords", selectedDoc); 
    } else if (selectionType === "multiple") {
      dispatch("selectedRecords", selectedDocs); 
    }
  }

  function openPageLink(link) {
    dispatch("textcmd", {text:`open/link/${link}`});
  }

  let selectedCount = selectionType === "multiple" ? selectedDocs.length : selectedDoc ? 1 : 0;

  //** this part is for loading the data and loading the list of fields available and to enable selection of fields ***//
  let isLoading = $state(true); // Show loading state

  let showFields = {
    "meta.title":true,
    "meta.link": true,
    "meta.created_on": true,
    "meta.updated_on": true,
    schema: true,
  };
  const toggledFields = writable({ ...showFields });
  let availableFields = new Set();
  let allFields = writable([]);

  // Function to dynamically gather all available fields from the docs
  function gatherFields() {
    docs.forEach((doc) => {
      if(doc.data){
        Object.keys(doc.data).forEach((field) =>
        availableFields.add(`data.${field}`)
      );
      }
      if(doc.meta){
        Object.keys(doc.meta).forEach((field) =>
        availableFields.add(`meta.${field}`)
      );
      }     
    });
    //console.log(availableFields)
    availableFields.add("schema");
    availableFields.add("_id");
    availableFields.add("_rev");
    // Combine provided additional fields with the ones found dynamically
    allFields.set(Array.from(availableFields));
    //console.log("fields set")
  }

  // Helper function to access nested fields (data.field or meta.field)
  function getFieldValue(doc, field) {
    // Check if the field is nested (e.g., "obj.key") or a root field (e.g., "schema")
    const isNested = field.includes(".");
    let display = "";

    if (isNested) {
      // If nested, split into object and key
      const [obj, key] = field.split(".");
      display = doc[obj] && doc[obj][key] ? doc[obj][key] : "";
    } else {
      // If root-level, directly get the field value
      display = doc[field] ? doc[field] : "";
    }

    // Define special types and handlers
    const special_types = {
      date: (value) => {
        const date = new Date(value * 1000); // Assuming value is a Unix timestamp in seconds
        return date.toLocaleString();
      },
    };

    // Define fields that need special handling
    const special_fields = {
      "meta.created_on": special_types.date,
      "meta.updated_on": special_types.date,
      "data.time":special_types.date
      // Add more fields that need special handling if necessary
    };

    // Check if the field requires special handling
    if (special_fields[field] && display) {
      display = special_fields[field](display);
    }

    return display;
  }

  // Fetch and load the data based on the query
  async function loadData() {
    isLoading = true;
    try {
      allFields.set([]);
      gatherFields();
      isLoading = false; // Set loading to false once data is loaded
    } catch (error) {
      console.error("Error loading data:", error);
      isLoading = false; // Set loading to false on error
    }
  }

  function handleFieldSelectionCheckbox(field, event) {
    toggledFields.update((f) => {
      f[field] = event.target.checked;
      //console.log(f)
      return f;
    });
  }

  let sortDirections = writable({});

  function handleSort(field) {
    const currentDirection = $sortDirections[field] || "asc";
    const newDirection = currentDirection === "asc" ? "desc" : "asc";

    // Update the sort direction for the clicked field
    sortDirections.update((directions) => {
      directions[field] = newDirection;
      return directions;
    });

    // Sort docs based on the clicked field and direction
    const direction = newDirection;
    docs = docs.sort((a, b) => {
      let aValue, bValue;

      // Check if the field is a root field, nested in 'data', or nested in 'meta'
      if (field.includes("data.")) {
        aValue = a.data[field.split(".")[1]];
        bValue = b.data[field.split(".")[1]];
      } else if (field.includes("meta.")) {
        aValue = a.meta[field.split(".")[1]];
        bValue = b.meta[field.split(".")[1]];
      } else {
        // Handle root-level fields
        aValue = a[field];
        bValue = b[field];
      }

      if (aValue === bValue) return 0;
      return direction === "asc"
        ? aValue < bValue
          ? -1
          : 1
        : aValue > bValue
          ? -1
          : 1;
    });
  }

  function showJSON(record) {
    selectedJSON = record;
  }
  async function copyToClipboard() {
    if (selectedJSON) {
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(selectedJSON, null, 2)
        );
        // alert("JSON copied to clipboard!"); // Notify user
      } catch (err) {
        console.error("Failed to copy JSON: ", err);
      }
    }
  }

  // Load data on component mount and whenever query changes
  onMount(() => {
    console.log(docs)
    loadData();
  });

  // afterUpdate(() => {
  //   if (query && Object.keys(query).length > 0) {
  //     loadData();
  //   }
  // });
</script>

<!-- Dropdown for selecting "no", "single", or "multiple" -->
<!-- <div class="form-group">
  <label for="selectionType">Select Mode:</label>
  <select id="selectionType" bind:value={selectionType} class="form-control">
    <option value="no">No Selection</option>
    <option value="single">Single Selection</option>
    <option value="multiple">Multiple Selection</option>
  </select>
</div> -->

<div>
  {#if isLoading}
    <p>Searching...</p>
  {:else}
    <div>
      <!-- Show the fields dynamically in a details tag -->
      <p>Showing {docs.length} records.</p>
      <details>
        <summary>Data fields</summary>
        <div class="fields-grid">
          {#each $allFields as field (field)}
            <div class="field-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={$toggledFields[field]}
                  onchange={(e) => handleFieldSelectionCheckbox(field, e)}
                />
                {field}
              </label>
            </div>
          {/each}
        </div>
      </details>

      <details open>
        <summary>Record Details</summary>
        <pre>{selectedJSON
            ? JSON.stringify(selectedJSON, null, 2)
            : "Select a record to view JSON"}</pre>
        {#if selectedJSON}
          <button class="btn btn-sm btn-secondary" onclick={copyToClipboard}
            >Copy JSON to Clipboard</button
          >
          <!-- Copy button -->
        {/if}
      </details>

      <!-- Display the search results in a table -->
      <table class="table table-responsive">
        <thead>
          <tr>
            {#each $allFields as field, index}
              {#if $toggledFields[field]}
                <td
                  >{field}
                  <!-- <button
                    title="Sort based on this column"
                    class="btn btn-sm btn-outline-secondary p-0"
                    onclick={() => handleSort(field)}
                    aria-label="Sort"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-funnel-fill"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"
                      />
                    </svg></button> -->
                </td>
              {/if}
            {/each}
            <td> Actions </td>
          </tr>
        </thead>
        <tbody>
          {#each docs as doc}
            <tr>
              {#each $allFields as field, index}
                {#if $toggledFields[field]}
                  <td>
                    {#if field == "meta.link"}
                      <button
                        type="button"
                        class="btn btn-link"
                        onclick={()=>openPageLink(doc.meta.link)}
                        >{getFieldValue(doc, field)}</button
                      >
                    {:else}
                      {getFieldValue(doc, field)}
                    {/if}
                  </td>
                {/if}
              {/each}

              <td>
                <button
                  title="See JSON"
                  class="btn btn-link btn-sm p-0"
                  onclick={() => showJSON(doc)}
                  aria-label="See json"
                  >

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0"/>
                  </svg>
                  
                  </button
                >

                <button
                title="Click to copy link to clipboard"
                class="btn btn-link btn-sm"
                aria-label="Copy link to clipboard"
                onclick={() => {
                  copy_to_clipboard(doc.meta.link);
                }}
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
              </svg> 
              </button>



                {#if selectionType == "single"}
                  <input
                    type="radio"
                    name="docSelection"
                    onchange={() => handleSelection(doc.meta.link)}
                  />
                {/if}
                {#if selectionType === "multiple"}
                  <input
                    type="checkbox"
                    onchange={(e) =>
                      handleMultiSelection(doc.meta.link, e.target.checked)}
                  />
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if selectionType !== "no"}
        <button class="btn btn-primary mt-2" onclick={submitSelectedRecord}>
          Submit {selectedCount > 0 ? `(${selectedCount} selected)` : ""}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .fields-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .field-checkbox {
    display: flex;
    align-items: center;
  }

  .field-checkbox input {
    margin-right: 5px;
  }
</style>
