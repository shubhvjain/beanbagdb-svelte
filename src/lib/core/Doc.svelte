<script>
  import { onMount } from "svelte";

  import {
    copy_to_clipboard,
    format_timestamp,
    emit_bbdb_event,
    download_data,
    get_blank_object,
    update_meta_obj,
  } from "../bbdb_actions.js";

  import TagsEditor from "../utils/TagsEditor.svelte";
  import LinkEditor from "../utils/LinkEditor.svelte";
  import SchemaEditor from "../editors/SchemaEditor.svelte";
  import DefaultEditor from "$lib/editors/DefaultEditor.svelte";
  import GraphEdgeEditor from "$lib/editors/GraphEdgeEditor.svelte";
  import SettingEditor from "$lib/editors/SettingEditor.svelte";
  import MediaEditor from "$lib/editors/MediaEditor.svelte";
  import ScriptEditor from "$lib/editors/ScriptEditor.svelte";
  import AppSpace from "$lib/pages/AppSpace.svelte";
  import TextEditor from "$lib/editors/TextEditor.svelte";
  import ConfimButton from "$lib/ui/confimButton.svelte";

  let {
    BBDB,
    bbdb_action,
    new_doc = false,
    schema_name,
    edit_mode = "internal",
    custom_editors = {},
    custom_app_editors = [],
    doc_key = {},
    setting_schemas = {},
    new_temp = {},
  } = $props();

  const system_schema = {
    schema: {
      component: SchemaEditor,
      allow: {
        edit: true,
        new: true,
        view: true,
      },
      options: {
        new_show_title_input: false,
      },
    },
    system_edge: {
      component: GraphEdgeEditor,
      allow: {
        new: true,
        edit: true,
        view: true,
      },
      options: {
        new_show_title_input: false,
      },
    },
    system_log: {
      component: DefaultEditor,
      allow: {
        new: false,
        edit: false,
        view: true,
      },
      options: {
        new_show_title_input: false,
      },
    },
    system_setting: {
      component: SettingEditor,
      allow: {
        new: true,
        edit: true,
        view: true,
      },
      options: {
        new_show_title_input: false,
        setting_schema: setting_schemas,
      },
    },
    system_media: {
      component: MediaEditor,
      allow: {
        new: true,
        edit: true,
        view: true,
      },
    },
    system_script: {
      component: ScriptEditor,
      allow: {
        new: true,
        edit: true,
        view: true,
      },
    },
    system_text: {
      component: TextEditor,
      allow: {
        new: true,
        edit: true,
        view: true,
      },
    },
  };

  let doc = $state({});

  let loaded = $state(false);
  let loaded_message = $state("Loading");

  let schema = $state({});

  let new_data = $state({});
  let new_app_data = $state({});
  // let new_meta = $state({}); // later

  let new_data_meta = $state({});
  let add_data_valid = $state(false);
  let show_add_editor = $state(false);

  let selected_component = $state({
    component: DefaultEditor,
    allow: {
      new: true,
      edit: true,
      view: true,
    },
  });

  let add_status = $state({
    processing: false,
    message: "Adding",
    status: "info",
    links: [],
  });

  let edit_data_valid = $state(false);
  let full_doc = $state({});
  let doc_data = $state({}); // this is to pass to the editor component
  let mode = $state("view");

  function openMapInNewWindow(location) {
    if (!location || !location.latitude || !location.longitude) {
      throw new Error("Invalid location object");
    }
    const url = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=14`;
    window.open(url, "_blank");
  }

  let default_options = {
    new_show_title_input: true,
  };

  async function getCurrentLocationData() {
    if (!("geolocation" in navigator)) {
      console.log("Geolocation not supported");
      return {};
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.log(error);
          resolve({});
          //reject(new Error(error.message));
        }
      );
    });
  }

  onMount(async () => {
    //console.log(setting_schemas)
    if (new_doc == true) {
      try {
        if (!schema_name) {throw new Error("Init error. No schema name provided in new mode");}
        let schmea_search = await BBDB.get({
          type: "schema",
          criteria: { name: schema_name },
        });
        schema = schmea_search.data.schema;
        if (schmea_search.data.active == false) {
          throw new Error(
            "This schema is not active. New document cannot be created"
          );
        }
        new_data = get_blank_object(schema, schema_name) || {};

        if (new_temp.data) {
          new_data = { ...new_data, ...new_temp.data };
        }

        mode = "edit"; // since we need to show the form to create a new doc
        if (system_schema[schema_name]) {
          selected_component = system_schema[schema_name];
        } else if (custom_editors[schema_name]) {
          selected_component = custom_editors[schema_name];
        }

        // console.log(selected_component)

        if (!selected_component.options) {
          selected_component.options = { ...default_options };
        } else {
          selected_component.options = {
            ...default_options,
            ...selected_component.options,
          };
        }

        if (selected_component.options.new_show_title_input) {
          new_data_meta["title"] = `Doc`;
        }

        new_data_meta["tags"] = [];
        new_data_meta["link"] =
          `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

        //console.log(selected_component)
        if (new_temp.meta) {
          new_data_meta = { ...new_data_meta, ...new_temp.meta };
        }
        loaded = true;
        show_add_editor = true;
      } catch (error) {
        console.log(error);
        loaded = false;
        loaded_message = error.message;
      }
      // new document
    } else {
      try {
        if (!doc_key || Object.keys(doc_key).length == 0) {
          throw new Error("Doc search criteria not provided");
        }
        let criteria = { ...doc_key, include_schema: true };
        let search = await BBDB.read(criteria);
        schema = search.schema.schema;
        full_doc = search.doc;
        // validate meta and include default fields
        let ms = await BBDB.get({ type: "editable_meta_schema" });
        let new_meta = update_meta_obj(ms, full_doc["meta"]);
        //console.log(new_meta)
        full_doc["meta"] = new_meta;
        // console.log(full_doc)
        doc_data = full_doc.data;
        schema_name = search.schema.name;
        if (system_schema[schema_name]) {
          selected_component = system_schema[schema_name];
        } else if (custom_editors[schema_name]) {
          selected_component = custom_editors[schema_name];
        }
        loaded = true;
        // console.log(mode);
      } catch (error) {
        loaded = false;
        loaded_message = error.message; //"Doc search criteria not provided"
      }
    }
  });

  async function new_handle_bbdb_action(option) {}

  async function new_handle_add_button() {
    // console.log( JSON.stringify(new_app_data,null,2));
    //let app_data_full = {...new_app_data}
    add_status.processing = true;
    try {
      let new_doc = { schema: schema_name, data: new_data };
      if (selected_component.options.new_show_title_input) {
        new_doc["meta"] = new_data_meta;
      }
      let app_data = Object.fromEntries(
        Object.entries(new_app_data).filter(
          ([_, value]) => Object.keys(value).length > 0
        )
      );
      new_doc["app"] = { ...app_data };
      let current_loc = await getCurrentLocationData();
      console.log(current_loc);
      if (current_loc) {
        if (!new_doc["meta"]) {
          new_doc["meta"] = {};
        }
        new_doc["meta"]["location"] = { created: current_loc, updated: {} };
      }
      let resp = await BBDB.create(new_doc);
      console.log(resp);
      add_status.message = `Added ${resp.meta.link}`;
      add_status.status = "success";
      add_status.links.push(resp.meta.link);
      bbdb_action(
        emit_bbdb_event("new_document_created", {
          link: resp.meta.link,
          _id: resp._id,
        })
      );
      new_data = get_blank_object(schema, schema_name) || {};
      new_app_data = {};
      new_data_meta = { title: "",tags:[], link:`${Math.floor(1000 + Math.random() * 9000)}` };
      show_add_editor = false;
      setTimeout(() => {
        show_add_editor = true;
      }, 1);
    } catch (error) {
      console.log(error);
      //add_status.processing = true
      add_status.message = `${error.message}`;
      add_status.status = "danger";
    }
  }

  const edit_external = () => {
    console.log("External edit triggered with data:", data);
  };

  // to enable existing doc edit
  const open_edit = () => {
    mode = "edit";
    edit_data_valid = true;
  };

  const edit_internal = async () => {
    try {
      let current_loc = await getCurrentLocationData();
      let update_obj = { data: doc_data };
      if (current_loc) {
        let partial_meta = { ...full_doc.meta };
        if (!partial_meta["location"]) {
          partial_meta["location"] = { created: {}, updated: {} }; // Create the location object if it doesn't exist
        }
        partial_meta["location"]["updated"] = current_loc;
        update_obj["meta"] = partial_meta;
      }

      let update1 = await BBDB.update({
        criteria: doc_key,
        updates: update_obj,
        rev_id: full_doc._rev,
      });

      await bbdb_action(
        emit_bbdb_event("show_ui_message", {
          type: "success",
          message: "Saved",
        })
      );
      console.log(update1);
    } catch (error) {
      await bbdb_action(
        emit_bbdb_event("show_ui_message", {
          type: "error",
          message: error.message,
        })
      );
    }
  };

  const edit_update_meta_action_handler = async (data) => {
    console.log(data);
    if (data.name == "edit_partial_meta") {
      try {
        let update1 = await BBDB.update({
          criteria: doc_key,
          updates: data.data.update,
          rev_id: full_doc._rev,
        });
        console.log(update1);
        await bbdb_action(
          emit_bbdb_event("metadata_updated", {
            meta: full_doc.meta,
            id: full_doc._id,
          })
        );
        //console.log("now send to update eta")
        return { update: true, error: null };
      } catch (error) {
        await bbdb_action(
          emit_bbdb_event("show_ui_message", {
            type: "error",
            message: error.message,
          })
        );
        return { update: false, error: error };
      }
    }
  };

  const add_update_meta_action_handler = async (data) => {
    console.log(data);
    if (data.name == "edit_partial_meta") {
      new_data_meta["tags"] = data.data.update.meta.tags
    }
  };

  const edit_handle_bbdb_action = (data) => {
    console.log(data);
  };

  // to modify the title of the doc
  let isTitleEditing = $state(false);
  function toggleTitleEdit() {
    isTitleEditing = !isTitleEditing;
  }
  async function saveTitle() {
    // Perform save logic here
    if (full_doc.meta.title.trim().length == 0) {
      await bbdb_action(
        emit_bbdb_event("show_ui_message", {
          type: "error",
          message: "Title cannot be blank",
        })
      );
    } else {
      try {
        let update1 = await BBDB.update({
          criteria: doc_key,
          updates: { data: {}, meta: { title: full_doc.meta.title } },
          rev_id: full_doc._rev,
        });
        console.log(update1);
        await bbdb_action(
          emit_bbdb_event("metadata_updated", {
            meta: full_doc.meta,
            id: full_doc._id,
          })
        );
        toggleTitleEdit();
      } catch (error) {
        await bbdb_action(
          emit_bbdb_event("show_ui_message", {
            type: "error",
            message: error.message,
          })
        );
      }
    }
  }

  const switch_to_view = () => {
    mode = "view";
  };

  const generate_append = (t) => {
    switch (t) {
      case "dt":
        return new Date().toLocaleString(); // Human-readable date-time

      case "ut":
        return Math.floor(Date.now() / 1000); // Unix epoch timestamp

      default:
        return "Invalid type"; // Handle unknown cases
    }
  };

  const append_to_edit_title = (t) => {
    full_doc.meta.title += " " + generate_append(t);
  };

  const append_to_new_title = (t) => {
    new_data_meta.title += " " + generate_append(t);
  };

  const update_app_data = async (update) => {
    //
    //console.log("here")
    //console.log(update)
    try {
      let update1 = await BBDB.update({
        criteria: doc_key,
        updates: { app: update },
        //rev_id: full_doc._rev,
      });
      console.log(update1);
      bbdb_action(
        emit_bbdb_event("show_ui_message", {
          type: "success",
          message: "App data updated",
        })
      );
    } catch (error) {
      await bbdb_action(
        emit_bbdb_event("show_ui_message", {
          type: "error",
          message: error.message,
        })
      );
    }
  };

  const delete_doc = async () => {
    try {
      console.log("hihi");
      let deldoc = await BBDB.delete(doc_key);
      console.log(deldoc);
      loaded_message = "Doc deleted";
      loaded = false;
    } catch (error) {
      console.log(error);
    }
  };
</script>

{#if loaded}
  {#if new_doc == true}
    {#if selected_component.allow.new}
      {#if selected_component.options.new_show_title_input}
        <div class="input-group">
          <input
            bind:value={new_data_meta.title}
            type="text"
            class="form-control"
            aria-label="Text input with dropdown button"
          />
          <button
            class="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              fill="currentColor"
              class="bi bi-three-dots-vertical"
              viewBox="0 0 16 16"
            >
              <path
                d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
              />
            </svg></button
          >
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button
                onclick={() => append_to_new_title("dt")}
                class="dropdown-item"
                href="#"
                >Append Date time
              </button>
            </li>
            <li>
              <button
                onclick={() => append_to_new_title("ut")}
                class="dropdown-item"
                href="#">Append Unix Epoch</button
              >
            </li>
            <!-- <li><a class="dropdown-item" href="#">Append </a></li> -->
          </ul>
        </div>

        <!-- <input class="form-control" bind:value={new_data_meta.title} type="text" placeholder="New {schema.title||"Document"} title" aria-label=".form-control-lg example">       -->
      {/if}
      {#if show_add_editor}
        <div class="pt-2">
          <selected_component.component
            bind:data={new_data}
            {schema}
            mode="edit"
            {new_doc}
            {BBDB}
            bbdb_action={new_handle_bbdb_action}
            bind:data_valid={add_data_valid}
            options={selected_component.options}
          />
        </div>
        <AppSpace
          bind:app_data={new_app_data}
          {BBDB}
          {bbdb_action}
          {new_doc}
          {schema_name}
          {custom_app_editors}
        />
        {#if add_data_valid}
          <button
            class="btn btn-primary btn-sm m-1"
            onclick={new_handle_add_button}>+ Add</button
          >
        {/if}
        {#if add_status.processing}
          <div class="alert alert-{add_status.status}">
            {add_status.message}
          </div>
        {/if}
      {/if}

      <details>
        <summary>Meta</summary>
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Link</span>
            <input
              type="text"
              bind:value={new_data_meta.link}
              class="form-control"
              placeholder="Link"
              aria-label="Link"
              aria-describedby="basic-addon1"
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon2">Tags</span>
            <TagsEditor
            bbdb_action={add_update_meta_action_handler}
            tags={new_data_meta.tags}
            link="new_not_available"
          />
          </div>
      </details>
    {:else}
      New insertion of {schema_name} is not supported using this editor
    {/if}
  {:else if new_doc == false}
    <div class="row">
      <div class="col-lg-12">
        <div class="d-flex">
          <div class="p-2 flex-grow-1">
            {#if isTitleEditing}
              <!-- Editing Mode -->
              <!-- <input
              type="text"
              class="form-control me-2"
              bind:value={full_doc.meta.title}
              placeholder="Enter title"
            /> -->

              <div class="input-group">
                <input
                  bind:value={full_doc.meta.title}
                  type="text"
                  class="form-control"
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-three-dots-vertical"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                    />
                  </svg></button
                >
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      onclick={() => append_to_edit_title("dt")}
                      class="dropdown-item"
                      href="#"
                      >Append Date time
                    </button>
                  </li>
                  <li>
                    <button
                      onclick={() => append_to_edit_title("ut")}
                      class="dropdown-item"
                      href="#">Append Unix Epoch</button
                    >
                  </li>
                  <!-- <li><a class="dropdown-item" href="#">Append </a></li> -->
                </ul>
              </div>
            {:else}
              <!-- Display Mode -->
              <h5 class="mb-0 me-2">{full_doc.meta.title}</h5>
            {/if}
          </div>
          <div class="p-2">
            {#if isTitleEditing}
              <!-- Editing Mode -->
              <!-- <input
              type="text"
              class="form-control me-2"
              bind:value={full_doc.meta.title}
              placeholder="Enter title"
            /> -->

              <button class="btn btn-primary btn-sm" onclick={saveTitle}
                >Save</button
              >
            {:else}
              <!-- Display Mode -->

              <button
                class="btn btn-link btn-sm p-0"
                onclick={toggleTitleEdit}
                aria-label="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  class="bi bi-pencil-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-type-h1"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M7.648 13V3H6.3v4.234H1.348V3H0v10h1.348V8.421H6.3V13zM14 13V3h-1.333l-2.381 1.766V6.12L12.6 4.443h.066V13z"
                  />
                </svg>
              </button>
            {/if}
          </div>
          <div class="p-2">
            <button
              title="Click to copy link to clipboard"
              class="btn btn-link btn-sm"
              aria-label="Copy link to clipboard"
              onclick={() => {
                copy_to_clipboard(full_doc.meta.link);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-clipboard"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"
                />
                <path
                  d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"
                />
              </svg>

              <!-- {full_doc.meta.link} -->
            </button>

            {#if selected_component.allow.edit}
              {#if mode == "view"}
                <button
                  class="btn btn-link btn-sm"
                  onclick={() =>
                    edit_mode === "external" ? edit_external() : open_edit()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-pencil-square"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                    />
                  </svg>
                  Edit
                </button>
              {:else}
                <button
                  class="btn btn-link btn-sm"
                  disabled={edit_data_valid ? "" : "disabled"}
                  onclick={() =>
                    edit_mode === "external"
                      ? edit_external()
                      : edit_internal()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-floppy"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 2H9v3h2z" />
                    <path
                      d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"
                    />
                  </svg>
                  Save
                </button>
                <button
                  class="btn btn-link btn-sm"
                  disabled={edit_data_valid ? "" : "disabled"}
                  onclick={() => switch_to_view()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-file-earmark"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"
                    />
                  </svg>
                  View
                </button>
              {/if}
            {/if}
          </div>
        </div>

        <div class="mt-1 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center"></div>
          <div class="d-flex align-items-center"></div>
        </div>
      </div>
    </div>

    {#if mode == "view"}
      {#if selected_component.allow.view}
        <selected_component.component
          bind:data={doc_data}
          {schema}
          mode="view"
          {new_doc}
          {BBDB}
          bbdb_action={new_handle_bbdb_action}
          bind:data_valid={edit_data_valid}
          options={selected_component.options}
        />
      {:else}
        Viewing {schema_name} doc is not supported. You can download the data using
        the button above
      {/if}
    {:else if mode == "edit"}
      {#if selected_component.allow.edit}
        <selected_component.component
          bind:data={doc_data}
          {schema}
          mode="edit"
          {new_doc}
          {BBDB}
          bbdb_action={edit_handle_bbdb_action}
          data_valid={edit_data_valid}
          options={selected_component.options}
        />

        {#if edit_data_valid == false}
          <p class="text text-danger">
            Validation error. Fix the errors to save changes
          </p>
        {/if}
      {:else}
        Editing {schema_name} doc is not supported. You can download the data using
        the button above
      {/if}
    {/if}

    <!-- meta data editor for all docs  -->
    <div class="row">
      <div class="col-lg-12">
        <details>
          <summary>Metadata</summary>

          <div class=" fw-lighter p-2">
            <div class="list-group">
              <li class="list-group-item list-group-item-light">
                <div class="p-1">
                  <button
                    title="Download file as json"
                    class="btn btn-link btn-sm"
                    onclick={() => {
                      download_data(
                        { doc: full_doc, schema },
                        `${full_doc.meta.link}.json`
                      );
                    }}
                    aria-label="JSON"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      fill="currentColor"
                      class="bi bi-download"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"
                      />
                      <path
                        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"
                      />
                    </svg> Download doc (JSON)
                  </button>
                  <!-- {#if !full_doc.schema.startsWith("system_") } -->
                  <ConfimButton title="Delete doc" onclick={delete_doc} />
                  <!-- {/if} -->
                </div>
              </li>

              <li class="list-group-item list-group-item-light">
                <div class="p-1"><i>Created</i></div>
                <div class="p-1">
                  {format_timestamp(full_doc.meta.created_on)}
                </div>
              </li>

              {#if full_doc.meta.location.created}
                <li class="list-group-item list-group-item-light">
                  <div class="p-1"><i>Created at </i></div>
                  <div class="p-1">
                    <button
                      class="btn btn-link"
                      onclick={() =>
                        openMapInNewWindow(full_doc.meta.location.created)}
                      >{full_doc.meta.location.created.latitude},{full_doc.meta
                        .location.created.longitude}</button
                    >
                  </div>
                </li>
              {/if}
              {#if full_doc.meta.location.updated}
                <li class="list-group-item list-group-item-light">
                  <div class="p-1"><i>Updated at </i></div>
                  <div class="p-1">
                    <button
                      class="btn btn-link"
                      onclick={() =>
                        openMapInNewWindow(full_doc.meta.location.updated)}
                      >{full_doc.meta.location.updated.latitude},{full_doc.meta
                        .location.updated.longitude}</button
                    >
                  </div>
                </li>
              {/if}

              <!-- {#if full_doc.meta?.location && full_doc.meta?.location?.created?.latitude}
          {/if}
          {#if full_doc.meta?.location && full_doc.meta?.location?.updated.latitude}
          {/if} -->

              <li class="list-group-item list-group-item-light">
                <div class="p-1"><i>Tags</i></div>
                <div class="p-1">
                  <TagsEditor
                    bbdb_action={edit_update_meta_action_handler}
                    link={full_doc.meta.link}
                    tags={full_doc.meta.tags}
                  />
                </div>
              </li>
              {#if full_doc.meta.updated_on}
                <li class="list-group-item list-group-item-light">
                  <div class="p-2"><i>Updated</i></div>
                  <div class="p-2">
                    {format_timestamp(full_doc.meta.updated_on)}
                  </div>
                </li>
              {/if}
              <li class="list-group-item list-group-item-light">
                <div class="p-1"><i>Link</i></div>
                <LinkEditor
                  bbdb_action={edit_update_meta_action_handler}
                  bind:link={full_doc.meta.link}
                />
              </li>
              <li class="list-group-item list-group-item-light">
                <div class="p-1"><i>ID</i></div>
                <div class="p-1">{full_doc._id}</div>
              </li>
            </div>
          </div>
        </details>
      </div>
    </div>
    {#if mode == "edit"}
      <div class="row">
        <div class="col-lg-12">
          <details>
            <summary>App Data</summary>
            <AppSpace
              on_update_click={update_app_data}
              app_data={full_doc["app"]}
              {BBDB}
              {bbdb_action}
              {new_doc}
              {schema_name}
              {custom_app_editors}
            />
          </details>
        </div>
      </div>
    {/if}
  {/if}
{:else}
  <!-- not loaded successfully -->

  <div class="container text-center">
    {#if loaded_message == "Loading"}
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    {/if}
    <p>{loaded_message}</p>
  </div>
{/if}
