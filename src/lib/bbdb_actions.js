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
  let valid_types = ["textcmd","selectedRecords",""]
  if(!valid_types.includes(name)){
    throw new Error("Invalid bbdb_action name")
  }
  if(name=="textcmd"){
    if(!data.text){
      throw new Error("textcmd requires data.text")
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