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

export const emit_bbdb_event = (name,data)=>{
  // valid types : textcmd -> data.text will be the command
  let valid_types = ["textcmd","selectedRecords","edit_partial_meta","new_document"]
  if(!valid_types.includes(name)){
    throw new Error("Invalid bbdb_action name")
  }
  if(name=="textcmd"){
    if(!data.text){
      throw new Error("textcmd requires data.text")
    }
  }else if (name=="edit_partial_meta"){
    if(!data.link){
      throw new Error("edit_partial requires data.link")
    }
  }else if (name=="new_document"){
    if(!data.schema||!data.data){
      throw new Error("new_document action required both schema and data")
    }
  }
  return {name,data}
}

/// utils
export const copy_to_clipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    
  });
};

export const format_timestamp =  (timestamp) =>
  new Date(timestamp * 1000).toLocaleString();


export const remove_some_keys = (obj, keysToRemove)=>{
  // Create a shallow copy of the original object
  const newObj = { ...obj };
  // Remove the specified keys
  keysToRemove.forEach(key => delete newObj[key]);
  return newObj;
}


export const stringify_object_fields = (obj)=>{
  const newObj = { ...obj }; 
  for (const key in newObj) {
    if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = JSON.stringify(newObj[key]);
    }
  }
  return newObj;
}


export const download_data = (jsonObject,fileName)=>{
      // Convert the JSON object to a string
      const jsonString = JSON.stringify(jsonObject, null, 2);
    
      // Create a Blob object with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      
      // Trigger the download by clicking the anchor
      link.click();
      
      // Clean up the URL object
      URL.revokeObjectURL(link.href);
}

export const get_schema_schema = (schema_doc)=>{
  let data = {
    meta : {
      type : "object",
      additionalProperties: false,
      properties: {
      
      }
    },
    schema_text: { type: "string"  },
    settings:schema_doc.properties.settings
  }
  const meta_fields  = ["active","name","title","description"]
  meta_fields.map(itm=>{
    data.meta.properties[itm] = schema_doc.properties[itm]
  })
  
  return data
}