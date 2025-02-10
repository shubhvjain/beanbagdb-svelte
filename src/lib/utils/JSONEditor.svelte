<script>

  import { onMount } from "svelte";
  import  {JSONEditor} from "@json-editor/json-editor";
  let {schema,data=$bindable(),data_valid=$bindable()}  = $props()


  // const dispatch = createEventDispatcher(); // Create event dispatcher

  let theEditor = $state(null) ; // this is where the json editor is loaded

  let config = $state({
    editable: true,
    data_exists: false,
    schema_exists: false,

    show_error: false,
    error: "Error in editor",
    error_class: "alert-warning",

    id: "",

    editor_loaded: false,
    pre_check: false,

    editor_options : {
      theme: "spectre",
      //theme: "html",
      titleHidden : true,
      disable_collapse: true,
      disable_edit_json: true,
      //disable_properties: true,
      use_default_values: true,
      disable_array_delete_last_row: true,
      disable_array_reorder: true,
      array_controls_top: false
    }
  });
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
    const default_options_values = {
      editable: true,
    };
    // Object.keys(default_options_values).map((key) => {
    //   config[key] = options?.key || default_options_values[key];
    // });
    // console.log(config);
    const must_all_be_true = [
      // { condition: config.data_exists === true, message: "Data is missing" },
      {
        condition: config.schema_exists === true,
        message: "Schema is missing",
      },
    ];

    let errors = must_all_be_true
      .filter((item) => !item.condition)
      .map((itm) => itm.message);
    //print(errors);

    let all_good = errors.length === 0;
    if (!all_good) {
      _set_error("Initialization Error : " + errors.join(", "), "alert-danger");
      throw new Error(config.error)
    }
    config.pre_checks = all_good;
    //print(config)
  };

  const load_editor =  () => {
    //const { JSONEditor } = await import("@json-editor/json-editor");
    const element = document.getElementById(config.id);
    // console.log(element)
    if(element){
      const editorOptions = {
      //show_errors:"change",
      //show_opt_in:true,
      //object_layout:"table",
      ...config.editor_options,
      schema: schema,
    };
      theEditor = new JSONEditor(element, editorOptions);
    }

    setTimeout(() => {
  
      if(config.data_exists){theEditor.setValue(data)}
      if(!config.editable){theEditor.disable()}

      // theEditor.enable();

      theEditor.on("change", () => {
        // Do something
        const errors = theEditor.validate();
        if (errors.length) {
          console.log(errors);
          // display Error(`Validation Errors \n${valErrMag(errors)}`)
          data_valid = false
        } else {
          data = theEditor.getValue();
          data_valid = true
          console.log(data);
        }

        // Emit inputChanged event
        // dispatch('inputChanged', {
        //   valid: errors.length === 0, // Check if there are validation errors
        //   data: data // Return the current data
        // });

      })
      
      config.editor_loaded = true
    }, 100);  



  };

  onMount(async () => {
    // Initialize the editor on load
    console.log(1)
    try {
      pre_checks();
      console.log(2)
      setTimeout(()=>{
        load_editor();
      },100)
      
    } catch (error) {
      console.log(error)
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
