<script>
  import { onMount } from "svelte";

  let { data = $bindable() } = $props();

  let tableContainer;

  function createTable(data, depth = 0) {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm bg-white';
    
    // Add depth-based styling for nested tables
    if (depth > 0) {
      table.style.fontSize = '0.9em';
      table.style.marginLeft = '10px';
    }

    if (Array.isArray(data)) {
      // Handle empty arrays
      if (data.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = '(empty array)';
        cell.className = 'text-muted fst-italic';
        return table;
      }

      data.forEach((item, index) => {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        cell1.textContent = index;
        cell1.className = 'text-muted';
        cell1.style.width = '50px';
        
        const cell2 = row.insertCell();
        if (typeof item === 'object' && item !== null) {
          cell2.appendChild(createTable(item, depth + 1));
        } else {
          cell2.textContent = formatValue(item);
          // Preserve whitespace for string values
          if (typeof item === 'string') {
            cell2.classList.add('preserve-whitespace');
          }
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      // Handle empty objects
      const keys = Object.keys(data);
      if (keys.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = '(empty object)';
        cell.className = 'text-muted fst-italic';
        return table;
      }

      for (const key in data) {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        cell1.innerHTML = `<strong>${escapeHtml(key)}</strong>`;
        cell1.className = 'align-top';
        cell1.style.width = '30%';
        
        const cell2 = row.insertCell();
        if (typeof data[key] === 'object' && data[key] !== null) {
          cell2.appendChild(createTable(data[key], depth + 1));
        } else {
          cell2.textContent = formatValue(data[key]);
          cell2.className = 'align-top';
          // Preserve whitespace for string values
          if (typeof data[key] === 'string') {
            cell2.classList.add('preserve-whitespace');
          }
        }
      }
    } else {
      const row = table.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 2;
      cell.textContent = formatValue(data);
      // Preserve whitespace for string values
      if (typeof data === 'string') {
        cell.classList.add('preserve-whitespace');
      }
    }

    return table;
  }

  function formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (value === '') return '(empty string)';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return value;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderTable() {
    if (data && tableContainer) {
      tableContainer.innerHTML = '';
      try {
        tableContainer.appendChild(createTable(data));
      } catch (error) {
        console.error('Error rendering table:', error);
        tableContainer.innerHTML = '<div class="alert alert-danger">Error rendering data</div>';
      }
    }
  }

  // Watch for changes to data prop and re-render
  $effect(() => {
    renderTable();
  });

  onMount(() => {
    renderTable();
  });
</script>

<style>
  :global(.table-responsive table) {
    margin-bottom: 0.5rem;
  }
  
  :global(.table-responsive td > table) {
    margin: 0;
  }
  
  :global(.table-responsive td, .table-responsive th) {
    word-wrap: break-word;
    white-space: normal;
    max-width: 400px;
    padding: 0.5rem;
  }

  :global(.table-responsive .table) {
    font-size: 0.875rem;
  }

  :global(.table-responsive .align-top) {
    vertical-align: top;
  }

  /* Preserve newlines, tabs, and spaces in string values */
  :global(.table-responsive .preserve-whitespace) {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
</style>

<div class="table-responsive">
  <div bind:this={tableContainer}></div>
</div>
