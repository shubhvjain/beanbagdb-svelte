import Ajv from "ajv";


///////////// methods related to the list of local databases available //////////
export const LOCAL_STORAGE_KEY_NAME = "beanbag_web_db_list";

export const get_database_list = () => {
  let databases = [];
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
  databases = storedData ? JSON.parse(storedData) : [];
  if (!storedData) {
    localStorage.setItem(LOCAL_STORAGE_KEY_NAME, JSON.stringify(databases));
  }
  return databases;
};

export const get_database_details = (db_name) => {
  //console.log(db_name)
  let databases = get_database_list();
  //console.log(databases)
  let search = databases.find((item) => {
    return item.name == db_name;
  });
  if (!search) {
    throw new Error(`DB ${db_name} does not exists`);
  }
  return search;
};

// Save validated database list to localStorage
export const save_database_store = (dbList) => {
  if (!Array.isArray(dbList)) {
    throw new Error("Invalid database list. Must be an array.");
  }
  const nameSet = new Set();
  dbList.forEach((db) => {
    if (!db.name || nameSet.has(db.name)) {
      throw new Error("Duplicate or invalid database name detected.");
    }
    nameSet.add(db.name);
    db.editable = false;
    db.showKey = false;
  });

  localStorage.setItem("beanbag_web_db_list", JSON.stringify(dbList));
  return dbList;
};

// to hand bbdb_action event

export const emit_bbdb_event = (name, data) => {
  // valid types : textcmd -> data.text will be the command
  let valid_types = [
    "textcmd",
    "selectedRecords",
    "edit_partial_meta",
    "new_document",
    "update_doc_data",
    "show_ui_message",
    "metadata_updated",
    "load_links",
    "edge_updated",
    "edge_deleted",
    "new_document_created",
    "load_this_node",
    "doc_deleted"
  ];
  if (!valid_types.includes(name)) {
    throw new Error("Invalid bbdb_action name");
  }
  if (name == "textcmd") {
    if (!data.text) {
      throw new Error("textcmd requires data.text");
    }
  } else if (name == "edit_partial_meta") {
    if (!data.link) {
      throw new Error("edit_partial requires data.link");
    }
  } else if (name == "new_document") {
    if (!data.schema || !data.data) {
      throw new Error("new_document action required both schema and data");
    }
  } else if (name == "update_doc_data") {
    if (!data.link) {
      throw new Error("update_doc_data requires data.link");
    }
  }
  else if (name == "show_ui_message") {
  if(!data.type){data.type="info"}
  if(!data.message){throw new Error("message is required")}
}
  return { name, data };
};

/// utils
export const copy_to_clipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {});
};

export const format_timestamp = (timestamp) =>
  new Date(timestamp * 1000).toLocaleString();

export const remove_some_keys = (obj, keysToRemove) => {
  // Create a shallow copy of the original object
  const newObj = { ...obj };
  // Remove the specified keys
  keysToRemove.forEach((key) => delete newObj[key]);
  return newObj;
};

export const stringify_object_fields = (obj) => {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (typeof newObj[key] === "object" && newObj[key] !== null) {
      newObj[key] = JSON.stringify(newObj[key]);
    }
  }
  return newObj;
};

export const download_data = (jsonObject, fileName) => {
  // Convert the JSON object to a string
  const jsonString = JSON.stringify(jsonObject, null, 2);

  // Create a Blob object with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // Trigger the download by clicking the anchor
  link.click();

  // Clean up the URL object
  URL.revokeObjectURL(link.href);
};

export const get_schema_schema = (schema_doc) => {
  let data = {
    meta: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
    schema_text: { type: "string" },
    settings: schema_doc.properties.settings,
  };
  const meta_fields = ["active", "name", "title", "description"];
  meta_fields.map((itm) => {
    data.meta.properties[itm] = schema_doc.properties[itm];
  });

  return data;
};
 

export const get_default_nav_items = ()=>{
  let outer = [
    {
      command:"new",
      text:"Create a new document",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>`
    },
   
    {
      command:"page/search",
      text:"Search in the DB",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>`
    },
    {
      command:"ui/graph",
      text:"Load Network explorer",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-3" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
</svg>`
    },
    {
      command:"home",
      text:"Workspace home",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
</svg>`
    }

  ]
  let inner = [
    
    {
      command:"page/info",
      text:"View DB Info",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info" viewBox="0 0 16 16">
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>`
    },
    {
      command:"page/plugins",
      text:"View and manage plugins",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plugin" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1 8a7 7 0 1 1 2.898 5.673c-.167-.121-.216-.406-.002-.62l1.8-1.8a3.5 3.5 0 0 0 4.572-.328l1.414-1.415a.5.5 0 0 0 0-.707l-.707-.707 1.559-1.563a.5.5 0 1 0-.708-.706l-1.559 1.562-1.414-1.414 1.56-1.562a.5.5 0 1 0-.707-.706l-1.56 1.56-.707-.706a.5.5 0 0 0-.707 0L5.318 5.975a3.5 3.5 0 0 0-.328 4.571l-1.8 1.8c-.58.58-.62 1.6.121 2.137A8 8 0 1 0 0 8a.5.5 0 0 0 1 0"/>
</svg>`
    },
    {
      command:"page/settings",
      text:"DB Settings",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
</svg>`
    } ,
    {
      command:"page/keys",
      text:"Available Keys",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
</svg>`
    },
    {
      command:"page/schemas",
      text:"List of schemas defined",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database" viewBox="0 0 16 16">
  <path d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"/>
</svg>`
    },
   
    {
      command:"page/help",
      text:"Help",
      icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question" viewBox="0 0 16 16">
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
</svg>`
    }
  ]

  return {inner,outer}
}


// to load a custom editor for a specific schema
export const load_editor = (options={doc:{},schema:{},mode:""}) => {
  let res = { new_doc: false, blank_data: {} }
  if (Object.keys(options.doc).length == 0) {res.new_doc = true} 
  else {if (Object.keys(options.doc.data).length == 0) {res.new_doc = true;}}
  if(res.new_doc){
    const ajv = new Ajv({code: {esm: true},strict:false,useDefaults:true}) // options can be passed, e.g. {allErrors: true}
    const data_copy = {}
    const validate = ajv.compile(options.schema);
    const valid = validate(data_copy);
    res.blank_data = data_copy
  }
  return res
};



// to load a custom editor for a specific schema
export const get_blank_object = (schema,schema_name="") => {
    if(schema_name=="schema"){
       let doc =  {
          name: "unnamed",
          title: "Untitled",
          description: "Description",
          active: false,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              value: { type:"number"}
            },
          },
          settings: {
            primary_keys: [],
            non_editable_fields: [],
            encrypted_fields: [],
            svg_icon25:"<svg xmlns='http://www.w3.org/2000/svg' width='25' height='16' fill='currentColor' class='bi bi-database-fill-gear' viewBox='0 0 16 16'><path d='M8 1c-1.573 0-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4s.875 1.755 1.904 2.223C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777C13.125 5.755 14 5.007 14 4s-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1'/><path d='M2 7v-.839c.457.432 1.004.751 1.49.972C4.722 7.693 6.318 8 8 8s3.278-.307 4.51-.867c.486-.22 1.033-.54 1.49-.972V7c0 .424-.155.802-.411 1.133a4.51 4.51 0 0 0-4.815 1.843A12 12 0 0 1 8 10c-1.573 0-3.022-.289-4.096-.777C2.875 8.755 2 8.007 2 7m6.257 3.998L8 11c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V10c0 1.007.875 1.755 1.904 2.223C4.978 12.711 6.427 13 8 13h.027a4.55 4.55 0 0 1 .23-2.002m-.002 3L8 14c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V13c0 1.007.875 1.755 1.904 2.223C4.978 15.711 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-1.3-1.905m3.631-4.538c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0'/></svg>"
          },
        }
        return doc
    }
    const ajv = new Ajv({code: {esm: true},strict:false,useDefaults:true}) // options can be passed, e.g. {allErrors: true}
    const data_copy = {}
    const validate = ajv.compile(schema);
    const valid = validate(data_copy);
    console.log(data_copy)
    return data_copy
};

export const update_meta_obj = (meta_schema,current)=>{
 const ajv = new Ajv({code: {esm: true},strict:false,useDefaults:true}) // options can be passed, e.g. {allErrors: true}
 const data_copy = {...current}
 const validate = ajv.compile(meta_schema);
 const valid = validate(data_copy);
 return data_copy
}