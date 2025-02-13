<!-- this is the UI to display the list of available BBDB instances and manage them -->
<script>
  import "../default.style.css";
  import { onMount } from "svelte";
  import { get_database_list, save_database_store } from "$lib/bbdb_actions.js";
  let { bbdb_action, on_link_click, PouchDB } = $props();

  let databases = $state([]);

  let message = $state("");
  let option1 = $state({ newName: "", newEncryptionKey: "" });
  let option2 = $state({ newName: "", newEncryptionKey: "", syncUrl: "", saveUrl:false });

  function generateAlphaNumericString(length = 24) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function replicate_remote(name, url) {
    try {
      const rep = PouchDB.replicate(url,name, {
        live: false,
        retry: true,
      })
        .on("complete", function (info) {
          // handle complete
          console.log(info)
          return info
        })
        .on("error", function (err) {
          // handle error
          throw err
        });

      //const db = new PouchDB(name);
      //const remoteCouch = url;
      //const opts = { live: false };
      // db.replicate.to(remoteCouch, opts, syncError);

      //let result = await db.replicate(remoteCouch, opts);
      //return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Fetch database list from localStorage on load
  onMount(() => {
    databases = get_database_list();
  });

  const sanitizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .replace(/\s+/g, "_");
  };

  const addDatabaseOption1 = () => {
    const sanitizedName = sanitizeName(option1.newName);
    if (!sanitizedName.trim()) {
      message = "Name cannot be empty";
      return;
    }
    if (databases.some((db) => db.name === sanitizedName)) {
      message = "Name already exists";
      return;
    }
    if (option1.newEncryptionKey.length < 24) {
      message = "Encryption key must be at least 24 characters";
      return;
    }
    databases = [
      ...databases,
      {
        name: sanitizedName,
        note: "",
        sync_url: "",
        encryption_key: option1.newEncryptionKey,
        editable: false,
        showKey: false,
      },
    ];
    option1.newName = "";
    option1.newEncryptionKey = "";
    message = "Saved successfully";
    saveToLocalStorage();
  };

  const addDatabaseOption2 = async () => {
    const sanitizedName = sanitizeName(option2.newName);
    if (!sanitizedName.trim()) {
      message = "Name cannot be empty";
      return;
    }
    if (databases.some((db) => db.name === sanitizedName)) {
      message = "Name already exists";
      return;
    }
    if (option2.newEncryptionKey.length < 24) {
      message = "Encryption key must be at least 24 characters";
      return;
    }
    databases = [
      ...databases,
      {
        name: sanitizedName,
        note: "",
        sync_url: option2.saveUrl? option2.syncUrl : "",
        encryption_key: option2.newEncryptionKey,
        editable: false,
        showKey: false,
      },
    ];

    try {
      let res = await replicate_remote(option2.newName, option2.syncUrl);
      console.log(res);
      option2.newName = "";
      option2.newEncryptionKey = "";
      option2.syncUrl = "";
      message = "Saved successfully";
      saveToLocalStorage();
    } catch (error) {
      console.log(error);
    }
  };

  const generate_random = () => {
    option1.newEncryptionKey = generateAlphaNumericString();
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
    databases = save_database_store(databases);
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

  const emit_open_link = (db_name) => {
    on_link_click({ db_name, page: "workspace" });
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

      <div class="card">
        <div class="card-header">New database</div>
        <div class="card-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control d-inline w-auto"
              bind:value={option1.newName}
              placeholder="Database Name"
            />
            <input
              type="text"
              class="form-control d-inline w-auto"
              bind:value={option1.newEncryptionKey}
              placeholder="Encryption Key"
            />

            <button class="btn btn-link" onclick={generate_random}
              >Generate random key</button
            >

            <button class="btn btn-primary" onclick={addDatabaseOption1}
              >Option 1 : Create a new Database</button
            >
          </div>
          <hr />
          or
          <div class="mt-2 mb-3">
            <input
              type="text"
              class="form-control d-inline w-auto"
              bind:value={option2.newName}
              placeholder="Database Name"
            />
            <input
              type="text"
              class="form-control d-inline w-auto"
              bind:value={option2.newEncryptionKey}
              placeholder="Encryption Key"
            />

            <input
              type="text"
              title="CouchDB URL (http://[username]:[password]@[hostname]:[port]/[database_name])"
              class="form-control d-inline w-auto"
              bind:value={option2.syncUrl}
              placeholder="CouchDB URL (http://[username]:[password]@[hostname]:[port]/[database_name])"
            />

            <div class="form-check">
              <input class="form-check-input" type="checkbox" bind:checked={option2.saveUrl} id="flexCheckDefault">
              <label class="form-check-label" for="flexCheckDefault">
                Save this as sync url 
              </label>
            </div>
            

            <button class="btn btn-primary mt-1" onclick={addDatabaseOption2}
              >Option 2 : Clone an existing one using CouchDB URL</button
            >
          </div>
        </div>
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

                <button
                  class="btn btn-link p-1 m-1"
                  onclick={() => emit_open_link(database.name)}
                >
                  Load workspace</button
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
