<script>
  import { onMount } from "svelte";
  import { JSONEditor } from "@json-editor/json-editor";
  let {
    schema,
    data = $bindable(),
    data_valid = $bindable(),
    editor_options = {},
  } = $props();

  let theEditor = $state(null);
  let config = $state({});
  let isInternalChange = $state(false); // Flag to prevent circular updates

  print = (obj) => {
    console.log(obj);
  };

  const _get_editor_name = () =>
    "editor-" + (Math.floor(Math.random() * 9000) + 1000);
  
  const _set_error = (error, type = "alert-danger") => {
    config.error_class = type;
    config.show_error = error ? true : false;
    config.error = error || "";
  };

  const pre_checks = () => {
    config.id = _get_editor_name();
    config.schema_exists = Object.keys(schema).length > 0;
    config.data_exists = Object.keys(data).length > 0;
    
    const must_all_be_true = [
      {
        condition: config.schema_exists === true,
        message: "Schema is missing",
      },
    ];

    let errors = must_all_be_true
      .filter((item) => !item.condition)
      .map((itm) => itm.message);

    let all_good = errors.length === 0;
    if (!all_good) {
      _set_error("Initialization Error : " + errors.join(", "), "alert-danger");
      throw new Error(config.error);
    }
    config.pre_checks = all_good;
  };

  const load_editor = () => {
    const element = document.getElementById(config.id);
    if (element) {
      const editorOptions = {
        ...config.editor_options,
        schema: schema,
      };
      theEditor = new JSONEditor(element, editorOptions);
    }

    setTimeout(() => {
      if (config.data_exists) {
        theEditor.setValue(data);
      }
      if (!config.editable) {
        theEditor.disable();
      }

      theEditor.on("change", () => {
        const errors = theEditor.validate();
        if (errors.length) {
          console.log(errors);
          data_valid = false;
        } else {
          isInternalChange = true; // Set flag before updating
          data = theEditor.getValue();
          data_valid = true;
        }
      });

      config.editor_loaded = true;
    }, 100);
  };

  // Watch for external changes to data prop
  $effect(() => {
    if (theEditor && config.editor_loaded && !isInternalChange) {
      // Only update if the change came from outside the editor
      const currentEditorValue = theEditor.getValue();
      
      // Check if data actually changed to avoid unnecessary updates
      if (JSON.stringify(currentEditorValue) !== JSON.stringify(data)) {
        theEditor.setValue(data);
      }
    }
    
    // Reset the flag after the effect runs
    if (isInternalChange) {
      isInternalChange = false;
    }
  });

  onMount(async () => {
    config = {
      editable: true,
      data_exists: false,
      schema_exists: false,

      show_error: false,
      error: "Error in editor",
      error_class: "alert-warning",

      id: "",

      editor_loaded: false,
      pre_check: false,

      editor_options: {
        theme: "html",
        titleHidden: true,
        disable_collapse: true,
        disable_edit_json: false,
        disable_properties: true,
        use_default_values: true,
        disable_array_delete_last_row: true,
        disable_array_reorder: true,
        array_controls_top: false,
        expand_height: true,
        ...editor_options,
      },
    };

    try {
      pre_checks();
      setTimeout(() => {
        load_editor();
      }, 100);
    } catch (error) {
      console.log(error);
    }
  });

  let valErrMag = (error) => {
    let val = [];
    error.map((er) => {
      let pp = er.path.split(".");
      val.push(`- ${pp[1]} : ${er.message}`);
    });
    return val.join("\n");
  };
</script>

<div class="row">
  <div class="col">
    {#if config.show_error}
      <div class="alert {config.error_class}">
        {@html config.error}
      </div>
    {/if}

    {#if config.pre_checks}
      <div class="editor-json" id={config.id}></div>
    {/if}
  </div>
</div>
