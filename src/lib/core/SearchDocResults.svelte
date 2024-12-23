<script>
  import { onMount } from "svelte";
  let {docs,selectionType="no",bbdb_action} = $props() 
  import { writable } from "svelte/store";

  import {emit_bbdb_event} from "$lib/bbdb_actions.js"

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
      Object.keys(doc.data).forEach((field) =>
        availableFields.add(`data.${field}`)
      );
      Object.keys(doc.meta).forEach((field) =>
        availableFields.add(`meta.${field}`)
      );
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
                  <button
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
                    </svg></button
                  >
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
                        onclick={openPageLink(doc.meta.link)}
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
                  class="btn btn-sm btn-light p-0"
                  onclick={() => showJSON(doc)}
                  aria-label="See json"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-filetype-json"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM4.151 15.29a1.2 1.2 0 0 1-.111-.449h.764a.58.58 0 0 0 .255.384q.105.073.25.114.142.041.319.041.245 0 .413-.07a.56.56 0 0 0 .255-.193.5.5 0 0 0 .084-.29.39.39 0 0 0-.152-.326q-.152-.12-.463-.193l-.618-.143a1.7 1.7 0 0 1-.539-.214 1 1 0 0 1-.352-.367 1.1 1.1 0 0 1-.123-.524q0-.366.19-.639.192-.272.528-.422.337-.15.777-.149.456 0 .779.152.326.153.5.41.18.255.2.566h-.75a.56.56 0 0 0-.12-.258.6.6 0 0 0-.246-.181.9.9 0 0 0-.37-.068q-.324 0-.512.152a.47.47 0 0 0-.185.384q0 .18.144.3a1 1 0 0 0 .404.175l.621.143q.326.075.566.211a1 1 0 0 1 .375.358q.135.222.135.56 0 .37-.188.656a1.2 1.2 0 0 1-.539.439q-.351.158-.858.158-.381 0-.665-.09a1.4 1.4 0 0 1-.478-.252 1.1 1.1 0 0 1-.29-.375m-3.104-.033a1.3 1.3 0 0 1-.082-.466h.764a.6.6 0 0 0 .074.27.5.5 0 0 0 .454.246q.285 0 .422-.164.137-.165.137-.466v-2.745h.791v2.725q0 .66-.357 1.005-.355.345-.985.345a1.6 1.6 0 0 1-.568-.094 1.15 1.15 0 0 1-.407-.266 1.1 1.1 0 0 1-.243-.39m9.091-1.585v.522q0 .384-.117.641a.86.86 0 0 1-.322.387.9.9 0 0 1-.47.126.9.9 0 0 1-.47-.126.87.87 0 0 1-.32-.387 1.55 1.55 0 0 1-.117-.641v-.522q0-.386.117-.641a.87.87 0 0 1 .32-.387.87.87 0 0 1 .47-.129q.265 0 .47.129a.86.86 0 0 1 .322.387q.117.255.117.641m.803.519v-.513q0-.565-.205-.973a1.46 1.46 0 0 0-.59-.63q-.38-.22-.916-.22-.534 0-.92.22a1.44 1.44 0 0 0-.589.628q-.205.407-.205.975v.513q0 .562.205.973.205.407.589.626.386.217.92.217.536 0 .917-.217.384-.22.589-.626.204-.41.205-.973m1.29-.935v2.675h-.746v-3.999h.662l1.752 2.66h.032v-2.66h.75v4h-.656l-1.761-2.676z"
                    />
                  </svg></button
                >

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
