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


///////////////// Methods for pages/ settings

export const emit_event = (name = "ping", data = {}) => {
  return { name, data };
};

export const emit_open_event = (link) => {
  return emit_event("open_link", { link: link });
};

