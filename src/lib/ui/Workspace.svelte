<script>
  import "../default.style.css";
  import "./workspace.css";
  import { BeanBagDB } from "beanbagdb";
  import { onMount } from "svelte";
  import {
    get_new_DB,
    destroy_db,
    sync_db_once,
  } from "$lib/db/beanbagdbweb.js";
  import { text_command } from "$lib/db/textcommand.js";
  import {graph_query} from "$lib/db/graph.js"
  import {get_default_nav_items} from "../bbdb_actions.js"

  // pages to display
  import WorkSpaceErrorPage from "./WorkSpaceErrorPage.svelte";
  import WorkSpaceHome from "./WorkSpaceHome.svelte";
  import DbPage from "../pages/DBPage.svelte";
  import NewDocument from "$lib/pages/NewDocument.svelte";
  import Document from "$lib/pages/Document.svelte";
  import GraphView from "$lib/pages/GraphView.svelte";
  let { db , uiComponents, settings ={}, onWorkspaceLoad  , custom_editors , additional_nav_items=[]} = $props();
  // export let db;

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
    theme: "dark",
    recent: [],
  });
  let pages = $state([]);
  let searchTerm = $state("");

  async function make_db_ready() {
    //console.log(db);
    await BBDB.ready();
    await BBDB.load_plugin("txtcmd", text_command);
    await BBDB.load_plugin("graph", graph_query);
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
      setting = await BBDB.get({
        type:"system_setting",
        criteria: { name: ui_setting_name },
      });
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

  let nav_items = $state({outer:[],inner:[]})
  onMount(async () => {
    // destroy_db("sample")
    if (uiComponents) {
      Object.keys(uiComponents).forEach((key) => {
        registerComponent(key, uiComponents[key]);
      });
    }
    nav_items = get_default_nav_items();
   
    if(additional_nav_items){
      nav_items.outer = [...nav_items.outer, ...additional_nav_items];
    }
    console.log(nav_items)
    // Dynamically import Bootstrap for initializing dropdowns
    import("bootstrap").then(({ Dropdown }) => {
      const dropdownTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="dropdown"]')
      );
      dropdownTriggerList.forEach((dropdownTriggerEl) => {
        new Dropdown(dropdownTriggerEl);
      });
    });

    console.log(nav_items)

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


      try {
        let s = await get_setting_doc();
        console.log(s);
      } catch (error) {
        console.log(error);
      }
    }

    if (onWorkspaceLoad) {
      await onWorkspaceLoad(BBDB);
    }

    if(settings.initial_pages){
      settings.initial_pages.forEach((itm) => {
        runTextCommand(itm);
      });
    }else{
      let test = [
       // "new/system_script",
       // "ui/graph",  
        "home",
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
              size:"medium",
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
              settings : settings
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
          let search = pages.find(
            (item) =>
              item.name == cmd.name &&
              item.criteria.type == cmd.criteria.type &&
              item.criteria.page_key == cmd.criteria.page_key
          );
          //console.log(search)
          if(search){
            focusOnItem(search.id);
            return;
          }
          let system_ui = {graph:{component:GraphView},export:{component:ExportData}}
          console.log(cmd)
          if(customUIComponents[cmd.criteria.page_key]){
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "medium",
              component: customUIComponents[cmd.criteria.page_key].component,
              component_data: cmd.criteria.params
            });
            setTimeout(() => {
              focusOnItem(new_id);
            }, 10);
          }else if(system_ui[cmd.criteria.page_key]){
            let new_id = Math.round(Math.random() * 10000);
            pages.push({
              ...cmd,
              id: new_id,
              size: "large",
              component: system_ui[cmd.criteria.page_key].component,
              component_data: cmd.criteria.params
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

  function changePageSize(page) {
    let currentIndex = sizes.indexOf(page.size);
    let nextIndex = (currentIndex + 1) % sizes.length; // Loop back when reaching the last size
    page.size = sizes[nextIndex];
    //page.size = newSize; // Update the size property
  }


  import { writable } from 'svelte/store';
  import ExportData from "$lib/pages/ExportData.svelte";

  // Store to manage messages
   const messageStore = writable([]);

  // Function to add a message
   function addMessage(text, type = "info", timeout = 3000) {
    const id = Date.now();
    messageStore.update((messages) => [...messages, { id, text, type }]);

    // Remove message after timeout
    setTimeout(() => {
      messageStore.update((messages) => messages.filter((msg) => msg.id !== id));
    }, timeout);
  }

  function handleBBDBActions(action) {
    //this is the handler for opening requests coming from child components
    if (action.name == "textcmd") {
      runTextCommand(action.data.text);
    }
    if(action.name=="show_ui_message"){
      addMessage(action.data.message,action.data.type)
    }
  }
  const sizes = ["small", "medium", "large", "full"];
</script>

{#if !Error & Loaded}
  <div class="workspace container-fluid" data-bs-theme={workspace.theme}>
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <h4 class="navbar-brand pl-4 ml-2 mb-0">
          <code>{db.name}</code> DB
        </h4>
        <div class="d-flex" role="search">
          <div class="message-container">
            {#each $messageStore as message}
              <div class="message {message.type}">
                {message.text}
              </div>
            {/each}
          </div>
       
          <input
            class="form-control form-control-sm"
            bind:value={searchTerm}
            placeholder="Text command"
            aria-label="Search term"
            type="text"
            list="textcommands"
          />
          
          <datalist id="textcommands">
            <!-- <option value="search/filter?"> -->
            <option value="new">
            <option value="home">
            <option value="open/link/">
            <option value="open/id/">
            <option value="ui/">
          </datalist>

          <button
            class="btn btn-sm btn-secondary"
            type="button"
            onclick={() => runTextCommand(searchTerm)}
            aria-label="Run text command.Type help for more"
            title="Run text command.Type help for more"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
          </svg>
          </button>
          <button
            onclick={toggleTheme}
            type="button"
            class="btn btn-secondary btn-sm"
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
            class="btn  btn-secondary b"
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

          {#each  nav_items.outer as itm}
          <button
            class="btn btn-sm btn-primary"
            type="button"
            onclick={()=>{runTextCommand(itm.command)}}
            aria-label="Run text command.Type help for more"
            title="Run text command.Type help for more">
          {@html itm.icon} 
          </button>
          {/each}
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
              <button class="btn btn-sm text-secondary" onclick={()=>changePageSize(page)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows" viewBox="0 0 16 16">
                  <path d="M1.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L2.707 7.5h10.586l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L13.293 8.5H2.707l1.147 1.146a.5.5 0 0 1-.708.708z"/>
                </svg>
              </button>
             

              <button
                class="btn btn-sm text-danger"
                onclick={() => closePage(page.id)}
                aria-label="Close page"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
              </svg>
              </button>
            </div>
          </div>

          {#if page.name=="ui"}
            <page.component this={page.component} {BBDB} {page} data={page.component_data} custom_editors={custom_editors} page_bbdb_action={handleBBDBActions} />
          {:else if page.name == "page"}
            <DbPage {BBDB} {page} page_bbdb_action={handleBBDBActions} />
          {:else if page.name == "open"}
            <Document {BBDB} {page} page_bbdb_action={handleBBDBActions} custom_editors={custom_editors} />
          {:else if page.name == "new"}
            <NewDocument {BBDB} {page} page_bbdb_action={handleBBDBActions} custom_editors={custom_editors} />
          {:else if page.name == "error"}
            <WorkSpaceErrorPage details={page} />
          {:else if page.name == "home"}
            <WorkSpaceHome {BBDB} {page} page_bbdb_action={handleBBDBActions} />
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
