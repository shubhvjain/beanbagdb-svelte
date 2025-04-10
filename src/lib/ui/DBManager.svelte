<!-- this is the UI to display the list of available BBDB instances and manage them -->
<script>
  import "../default.style.css";
  import { onMount } from "svelte";
  import { get_database_list, save_database_store } from "$lib/bbdb_actions.js";
  let { bbdb_action, on_link_click, PouchDB } = $props();

  let databases = $state([]);

  let message = $state("");
  let option1 = $state({ newName: "", newEncryptionKey: "" });
  let option2 = $state({
    newName: "",
    newEncryptionKey: "",
    syncUrl: "",
    saveUrl: false,
  });
  let show_new_card = $state(false);
  const toggle_new_card = () => {
    show_new_card = !show_new_card;
  };

  function generateAlphaNumericString(length = 24) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function exportDocuments(PouchDB, db_name) {
    let pdb = new PouchDB(db_name);
    const result = await pdb.allDocs({ include_docs: true });
    let documents = result.rows.map((row) => row.doc);
    downloadJSON({ data: documents }, `.${db_name}-backup.json`);
  }

  async function deleteDatabase(PouchDB, name) {
    let pdb = new PouchDB(name);
    pdb
      .destroy()
      .then(() => {
        console.log("Database deleted successfully.");
        return;
      })
      .catch((err) => {
        console.error("Error deleting database:", err);
        throw err;
      });
  }

  async function delete_a_database(dbname) {
    let a = confirm("Sure?");
    if (a) {
      try {
        let down_load = await exportDocuments(PouchDB, dbname);
        let del = await deleteDatabase(PouchDB, dbname);

        databases = databases.filter((obj) => obj.name !== dbname);
        saveToLocalStorage();
      } catch (error) {
        console.log(error);
      }
    }
  }

  function downloadJSON(data, name) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  }

  async function replicate_remote(name, url) {
    try {
      const rep = PouchDB.replicate(url, name, {
        live: false,
        retry: true,
      })
        .on("complete", function (info) {
          // handle complete
          console.log(info);
          return info;
        })
        .on("error", function (err) {
          // handle error
          throw err;
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  function getCurrentTimeString24h() {
    return new Date().toISOString();
}

  // Fetch database list from localStorage on load
  onMount(() => {
    document.title = "BBDB List"
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
        createdOn:getCurrentTimeString24h()
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
        sync_url: option2.saveUrl ? option2.syncUrl : "",
        encryption_key: option2.newEncryptionKey,
        editable: false,
        showKey: false,
        createdOn:getCurrentTimeString24h()
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

<div class="container">
  <div class="row">
    <div class="col-lg-12">
      <h3>Local database manager</h3>
      <p>
        On this page you will find the list of databases that are available on
        this browser. You can also modify certain details about the Db including
        the URL to sync through couchDB
      </p>

      {#if show_new_card}
      <div class="card">
        <div class="card-header">
          <div class="d-flex">
            <div class="w-100">New database setup</div>
            <div class="flex-shrink-1">  <button onclick={toggle_new_card} aria-label="Close" class="btn btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg></button> </div>
          </div>
        </div>
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
              <input
                class="form-check-input"
                type="checkbox"
                bind:checked={option2.saveUrl}
                id="flexCheckDefault"
              />
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
      {/if}
    </div>
  </div>

  <div class="row">
    {#each databases as database, index}
    <div class="col-lg-4  p-0 m-0">
      <div class="card" style="height:225px;overflow: auto; ">
        <div class="card-body">
          <h5 class="card-title"> <code>{database.name}</code></h5>
          <div class="card-text">
            {#if database.createdOn}
              <span class="fw-lighter">Created on : {database.createdOn}</span><br>
            {/if}
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
              <br>
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
                <br>
                {#if database.showKey}
                  {database.encryption_key}
                {:else}
                  ****
                {/if}
                
          </div>  
        </div>
        <div class="card-footer">
          <small class="text-body-secondary">   

            <button
            class="btn btn-link btn-sm card-link"
            onclick={() => delete_a_database(database.name)}>
            Delete</button>

            <button
            class=" btn btn-link btn-sm card-link"
            onclick={() => toggleEditable(index)}>
            {database.editable ? "Save" : "Edit"}
          </button>

          <button
          class="btn btn-link btn-sm card-link"
          onclick={() => toggleShowKey(index)}>{database.showKey ? "Hide" : "Show"} Keys</button>

        
          <button
          class="btn btn-success btn-sm card-link"
          onclick={() => emit_open_link(database.name)}>
          Load </button>

          
          </small>
        </div>
      </div>
    </div>
    {/each}



    <div class="col  p-0 m-0">
      <div class="card" style="height: 225px;overflow: auto; ">
        <div class="card-body">
       
          <div class="card-text text-center">
            <br><br>  <br>
            <button class="btn btn-lg" onclick={()=>toggle_new_card()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
              </svg>
              Add
            </button>
           
             
             
               
                
          </div>  
        </div>
      </div>
    </div>


  </div>
</div>

<div class="container-fluid">
 
</div>


