<script>
  import "$lib/default.style.css";
  import "$lib/ui/workspace.css";
  import { BeanBagDB } from "beanbagdb";
  import { onMount } from "svelte";
  import {
    get_new_DB,
    destroy_db,
    sync_db_once,
  } from "$lib/db/beanbagdbweb.js";
  import { text_command } from "$lib/db/textcommand.js";

  // pages to display
  import WorkSpaceErrorPage from "./WorkSpaceErrorPage.svelte";
  import WorkSpaceHome from "./WorkSpaceHome.svelte";
  import DbPage from "../pages/DBPage.svelte";
  import NewDocument from "$lib/pages/NewDocument.svelte";
  import Document from "$lib/pages/Document.svelte";


  let { db , uiComponents} = $props();
  // export let db;

/**
 * uiComponents : {command:{component,unique}}
 */


  let BBDB = $state(null);
  let Loaded = $state(false);
  let Error = $state();


  let customUIComponents = $state({});
  const registerComponent = (key,data)=>{
    if(customUIComponents[key]){
      console.log("Component already registered")
      return
    }
    customUIComponents[key]= data
    console.log("Component registered")
  }

  let workspace = $state({
    theme: "light",
    recent: [],
  });
  let pages = $state([]);
  let searchTerm = $state("");

  async function make_db_ready() {
    console.log(db);
    await BBDB.ready();
    await BBDB.load_plugin("txtcmd", text_command);
    console.log("Plugin loaded");
    // load workspace settings
  }

  let ui_setting_name = "ui_workspace";

  async function get_setting_doc() {
    let default_workspace_settings = {
      theme: "dark",
      live_sync: false,
      recent: [],
    };
    let setting;
    try {
      setting = await BBDB.get(
        "system_setting",
        { name: ui_setting_name },
        false
      );
    } catch (error) {
      setting = await BBDB.modify_setting(
        "ui_workspace",
        default_workspace_settings,
        "append"
      );
    }
    return setting?.data?.value || default_workspace_settings;
  }

  async function update_ws_setting(key, value) {
    let data = await BBDB.modify_setting(
      "ui_workspace",
      { key: value },
      "append"
    );
  }

  async function sync_pouchdb() {
    console.log(db);
    try {
      let result = await sync_db_once(db);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  onMount(async () => {
    // destroy_db("sample")
    console.log(uiComponents);
    // see if custom components are provided
    if (uiComponents) {
      Object.keys(uiComponents).forEach((key) => {
        registerComponent(key, uiComponents[key]);
      });
    }

    console.log(customUIComponents);


    if (!BBDB) {
      if (!db) {
        Loaded = true;
        Error = "Error : No details about the database were provided";
      }
      try {
        BBDB = get_new_DB(db);
        Loaded = true;
      } catch (error) {
        console.log(error);
        Error = "Error: " + error.message;
        Loaded = true;
      }
    }

    if (BBDB instanceof BeanBagDB == false) {
      Loaded = true;
      Error = "Invalid Database connection";
    }

    if (BBDB.active) {
      console.log("ready...");
    } else {
      try {
        await make_db_ready();
      } catch (error1) {
        console.log(error1);
      }

      //searchPage("dbsettings")

      try {
        let s = await get_setting_doc();
        console.log(s);
      } catch (error) {
        console.log(error);
      }
    }

    if (pages.length == 0) {
      // ["info","plugins","settings","keys","help","schemas","search"]
      let test = [
        "home",
        // "page/info",
        // "page/help",
        //"page/search",
        //  "page/plugins",
        //"page/schemas",
        // "page/keys",
        //"page/settings",
        // "new"
      ];
      test.forEach((itm) => {
        runTextCommand(itm);
      });
      // new workspace, open the dash board automatically
      //searchPage("find/search")
      //searchPage("help/search")
    }
  });

  // Function to toggle the theme
  function toggleTheme() {
    workspace.theme = workspace.theme === "light" ? "dark" : "light";
  }

  const runTextCommand = async (text) => {
    let command = await BBDB.plugins["txtcmd"].parse(text);
    if (command.valid) {
      let process_commands = {
        page: (cmd) => {
          let search = pages.find(
            (item) =>
              item.name == cmd.name &&
              item.criteria.type == cmd.criteria.type &&
              item.criteria.link == cmd.criteria.link
          );

          if (!search) {
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "medium",
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
          } else {
            console.log("page already exists");
            focusOnItem(search.id);
          }
        },
        open: (cmd) => {
          let search = pages.find(
            (item) =>
              item.name == cmd.name &&
              item.criteria.type == cmd.criteria.type &&
              item.criteria.link == cmd.criteria.link
          );

          if (!search) {
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "medium",
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
          } else {
            console.log("page already exists");
            focusOnItem(search.id);
          }
        },
        new: (cmd) => {
          let new_id = Math.round(Math.random() * 10000);
          pages.push({
              ...cmd,
              id: new_id,
              size:"small",
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
        },
        home: (cmd) => {
          let search = pages.find(
            (item) =>
              item.name == cmd.name 
          );

          if (!search) {
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "small",
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
          } else {
            console.log("page already exists");
            focusOnItem(search.id);
          }
        },
        ui:(cmd)=>{
          console.log(cmd)
          if(customUIComponents[cmd.criteria.page_key]){
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "medium",
              component: customUIComponents[cmd.criteria.page_key].component,
              component_data: cmd.criteria
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
          }else{
            console.log("UI component not found")
            pushErrorPage("command404", `${text}`);
          }
        }
      };
      console.log(command)
      process_commands[command.name](command)
    } else {
      console.log("Error in command. Show it ");
      pushErrorPage("command404", `${text}`);
    }
  };

  function pushErrorPage(code, message) {
    let errorPage = {
      id: Math.round(Math.random() * 10000),
      size: "small",
      name: "error",
      criteria: {},
      code: code,
      message: message,
    };
    pages.push(errorPage);
  }

  function focusOnItem(id) {
    if (pages.length > 2) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  }

  // Method to close a page
  function closePage(pageId) {
    pages = pages.filter((page) => page.id !== pageId);
  }

  function changePageSize(page, newSize) {
    page.size = newSize; // Update the size property
  }

  function handleBBDBActions(data) {
    //this is the handler for opening requests coming from child components
    if (data.name == "textcmd") {
      runTextCommand(data.data.text);
    }
  }
</script>

{#if !Error & Loaded}
  <div class="workspace container-fluid" data-bs-theme={workspace.theme}>
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4 class="navbar-brand pl-4 ml-2 mb-0">
          <code>{db.name}</code> DB
        </h4>
        <div class="d-flex" role="search">
          <input
            class="form-control form-control-sm"
            bind:value={searchTerm}
            placeholder="Search or open new page..."
            aria-label="Search term"
            type="text"
          />
          <button
            class="btn btn-sm btn-outline-secondary"
            type="button"
            onclick={() => runTextCommand(searchTerm)}
            aria-label="Run text command.Type help for more"
            title="Run text command.Type help for more"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
              />
            </svg>
          </button>
          <button
            onclick={toggleTheme}
            type="button"
            class="btn btn-sm btn-outline-secondary b"
            aria-label="Change theme"
            title="toggle theme"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-palette-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07M8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
              />
            </svg></button
          >

          <button
            onclick={sync_pouchdb}
            type="button"
            class="btn btn-sm btn-outline-secondary b"
            aria-label="Sync data"
            title="Sync data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-repeat"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"
              />
              <path
                fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
    <!-- Pages Container -->
    <div class="pages-container">
      {#each pages as page}
        <div class="page {page.size}" id={page.id}>
          <div class="d-flex justify-content-between align-items-center">
            <span class="page-title"></span>
            <div class="d-flex align-items-center">
              <select
                class="form-select form-select-sm"
                style="width: auto;border-radius:0px;"
                onchange={(e) => changePageSize(page, e.target.value)}
                bind:value={page.size}
              >
                <option value="small">25%</option>
                <option value="medium">50%</option>
                <option value="large">75%</option>
                <option value="full">100%</option>
              </select>

              <button
                class="btn btn-sm btn-outline-danger"
                onclick={() => closePage(page.id)}
                aria-label="Close page"
              >
              <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          {#if page.name=="ui"}
            <page.component this={page.component} {BBDB} {page} />
          {:else if page.name == "page"}
            <DbPage {BBDB} {page} page_bbdb_action={handleBBDBActions} />
          {:else if page.name == "open"}
            <Document {BBDB} {page} page_bbdb_action={handleBBDBActions} />
          {:else if page.name == "new"}
            <NewDocument {BBDB} {page} page_bbdb_action={handleBBDBActions} />
          {:else if page.name == "error"}
            <WorkSpaceErrorPage details={page} />
          {:else if page.name == "home"}
            <WorkSpaceHome {BBDB} page_bbdb_action={handleBBDBActions} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="alert alert-primary">
    {Error || "Loading"}
  </div>
{/if}
