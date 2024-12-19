<script>
  import "$lib/default.style.css";
  import { onMount } from "svelte";
  import { emit } from "$lib/bbdb_actions.js";
  let { bbdb_action } = $props();

  let databases = $state([]);
  let newName = $state("");
  let newEncryptionKey = $state("");
  let message = $state("");

  // Fetch database list from localStorage on load
  onMount(() => {
    const storedData = localStorage.getItem("beanbag_web_db_list");
    databases = storedData ? JSON.parse(storedData) : [];
    if (!storedData) {
      localStorage.setItem("beanbag_web_db_list", JSON.stringify(databases));
    }
  });

  const sanitizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .replace(/\s+/g, "_");
  };

  const addDatabase = () => {
    const sanitizedName = sanitizeName(newName);
    if (!sanitizedName.trim()) {
      message = "Name cannot be empty";
      return;
    }
    if (databases.some((db) => db.name === sanitizedName)) {
      message = "Name already exists";
      return;
    }
    if (newEncryptionKey.length < 16) {
      message = "Encryption key must be at least 16 characters";
      return;
    }
    databases = [
      ...databases,
      {
        name: sanitizedName,
        note: "",
        sync_url: "",
        encryption_key: newEncryptionKey,
        editable: false,
        showKey: false,
      },
    ];
    newName = "";
    newEncryptionKey = "";
    message = "Saved successfully";
    saveToLocalStorage();
  };

  const editDatabase = (index, field, value) => {
    databases[index][field] = value;
    // databases[index]["editable"] = false
    // databases[index]["showKey"] = false
    // saveToLocalStorage();
    // message = 'Saved successfully';
  };

  const toggleEditable = (index) => {
    if (databases[index].editable == true) {
      // save the data and disable
      saveToLocalStorage(index);
    } else {
      databases[index].editable = true;
      // just toggle
    }
  };

  const toggleShowKey = (index) => {
    databases[index].showKey = true;
    setTimeout(() => {
      databases[index].showKey = false;
    }, 5000);
  };

  const saveToLocalStorage = (index = null) => {
    if (index != null) {
      databases[index]["editable"] = false;
      databases[index]["showKey"] = false;
    }
    localStorage.setItem("beanbag_web_db_list", JSON.stringify(databases));
  };

  const removeDatabase = (index) => {
    databases.splice(index, 1);
    saveToLocalStorage();
    message = "Removed successfully";
  };

  const test = () => {
    console.log("hello");
    let data = emit("ping", { message: "Hello World" });
    console.log(data);
    bbdb_action(data);
  };
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-lg-12">
      <h3>Local database manager</h3>
      <p>
        On this page you will find the list of databases that are available on
        this browser. You can also modify certain details about the Db including
        the URL to sync through couchDB
      </p>

      <div class="mb-3">
        <input
          type="text"
          class="form-control d-inline w-auto"
          bind:value={newName}
          placeholder="Database Name"
        />
        <input
          type="text"
          class="form-control d-inline w-auto"
          bind:value={newEncryptionKey}
          placeholder="Encryption Key"
        />
        <button class="btn btn-primary" onclick={addDatabase}
          >Add Database</button
        >
      </div>
      <p class="text-secondary">{message}</p>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Note</th>
            <th>Sync URL</th>
            <th>Encryption Key</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each databases as database, index}
            <tr>
              <td> <code>{database.name}</code></td>
              <td>
                {#if database.editable}
                  <input
                    type="text"
                    class="form-control"
                    bind:value={database.note}
                    placeholder="Note"
                    oninput={(e) => editDatabase(index, "note", e.target.value)}
                  />
                {:else}
                  {database.note}
                {/if}
              </td>
              <td>
                {#if database.editable}
                  <input
                    type="text"
                    class="form-control"
                    bind:value={database.sync_url}
                    placeholder="http://[username]:[password]@[hostname]:[port]/[database_name]"
                    oninput={(e) =>
                      editDatabase(index, "sync_url", e.target.value)}
                  />
                {:else if database.showKey}
                  {database.sync_url}
                {:else}
                  ****
                {/if}
              </td>
              <td>
                {#if database.showKey}
                  {database.encryption_key}
                {:else}
                  ****
                {/if}
              </td>
              <td>
                <button
                  class="btn btn-secondary p-1 m-1"
                  onclick={() => toggleEditable(index)}
                >
                  {database.editable ? "Save" : "Edit"}
                </button>
                <!-- <button class="btn btn-danger" on:click={() => removeDatabase(index)}>Remove</button> -->

                <button
                  class="btn btn-secondary p-1 m-1"
                  onclick={() => toggleShowKey(index)}
                  >{database.showKey ? "Hide" : "Show"} Keys</button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <!-- <button class="btn btn-sm btn-dark" onclick={test}>Test</button> -->
    </div>
  </div>
</div>

<style>
  table {
    margin-top: 1rem;
  }
</style>
