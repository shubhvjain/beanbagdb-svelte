<script>
  import "$lib/default.style.css";
  import "$lib/ui/workspace.css";
  import { BeanBagDB } from "beanbagdb";
  import { onMount } from "svelte";
  import { get_new_DB, destroy_db } from "$lib/db/beanbagdbweb.js";
  import { text_command } from "$lib/db/textcommand.js";

  // pages to display
  import WorkSpaceErrorPage from "./WorkSpaceErrorPage.svelte";
  import WorkSpaceHome from "./WorkSpaceHome.svelte";
  import DbPage from "../pages/DBPage.svelte";
  import NewDocument from "$lib/pages/NewDocument.svelte";
  import Document from "$lib/pages/Document.svelte";

  // import DbOpen from "$lib/pages/DBOpen.svelte";

  let { db } = $props();
  // export let db;

  let BBDB;
  let Loaded = $state(false);
  let Error = $state();

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

  onMount(async () => {
    // destroy_db("sample")
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
      await make_db_ready();

      //searchPage("dbsettings")
    }

    if (pages.length == 0) {
      // ["info","plugins","settings","keys","help","schemas","search"]
      let test = [
      //  "home",
       // "page/info",
       // "page/help",
        "page/search",
      //  "page/plugins",
        "page/schemas",
       // "page/keys",
        "page/settings",
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
      let search
      if(command.name=="open"){
        search =  pages.find(
        (item) =>
          item.name == command.name &&
          item.criteria.type == command.criteria.type && 
          item.criteria.link == command.criteria.link
      );
      }else {
        search =  pages.find(
        (item) =>
          item.name == command.name &&
          item.criteria.type == command.criteria.type
      );
      }
      
      if (!search) {
        console.log("new page to open");
        let new_id = Math.round(Math.random() * 10000)
        pages.push({
          ...command,
          id:new_id ,
          size: "medium",
        });

        focusOnItem(new_id)
      } else {
        console.log("page already exists");
        focusOnItem(search.id);
      }
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
    if(data.name=="textcmd"){
      runTextCommand(data.data.text)
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

              <!-- Close Button -->
              <button
                class="btn btn-sm btn-outline-danger"
                onclick={() => closePage(page.id)}
                aria-label="Close page"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-x"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                  />
                </svg></button
              >
            </div>
          </div>

          {#if page.name == "page"}
            <DbPage {BBDB} {page} page_bbdb_action={handleBBDBActions} />
          {/if}

          {#if page.name == "open"}
            <Document {BBDB} {page} page_bbdb_action={handleBBDBActions}/>
          {/if}

          {#if page.name == "new"}
            <NewDocument {BBDB} {page} page_bbdb_action={handleBBDBActions}/>
          {/if}
        
          {#if page.name == "error"}
            <WorkSpaceErrorPage details={page} />
          {/if}
          {#if page.name == "home"}
            <WorkSpaceHome {BBDB} />
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
