<script>
  import { onMount } from "svelte";

  let {data=$bindable()} = $props()

  function createTable(data) {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm bg-white';

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        cell1.textContent = index;
        const cell2 = row.insertCell();
        if (typeof item === 'object' && item !== null) {
          cell2.appendChild(createTable(item));
        } else {
          cell2.textContent = item;
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        cell1.innerHTML = `<strong>${key}</strong>`;
        const cell2 = row.insertCell();
        if (typeof data[key] === 'object' && data[key] !== null) {
          cell2.appendChild(createTable(data[key]));
        } else {
          cell2.textContent = data[key];
        }
      }
    } else {
      const row = table.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 2;
      cell.textContent = data;
    }

    return table;
  }

  let tableContainer;
  onMount(()=>{
    if (data && tableContainer) {
    tableContainer.innerHTML = ''; // Clear old content
    tableContainer.appendChild(createTable(data));
  }
  })
</script>

<style>
  table {
    margin-bottom: 1rem;
  }
  td > table {
    margin: 0;
  }
  td, th {
    word-wrap: break-word;
    white-space: normal;
    max-width: 400px;
  }
</style>

<div class="table-responsive">
  <div bind:this={tableContainer}></div>
</div>
