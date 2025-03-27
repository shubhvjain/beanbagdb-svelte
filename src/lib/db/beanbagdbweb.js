import { BeanBagDB, DocNotFoundError, DocCreationError } from "beanbagdb";
// import PouchDB from "pouchdb-browser";
// import * as PouchDB from "./pouchdb.min.js";
// import * as PouchDBFind from "./pouchdb.find.js";

// this is a pouch db instance of beanbagdb used for testing.
import Ajv from "ajv";


export const get_pdb_doc = (PouchDB, dbname, secret) => {
  // let pdb = new PouchDB(dbname);
  let pdb = new PouchDB(dbname);
  const doc_obj = {
    name: dbname,
    db_name: "pouchdb",
    encryption_key: secret,
    api: {
      insert: async (doc) => {
        const result = await pdb.post(doc);
        return result;
      },
      // delete: ()=>{db1.destroy},
      update: async (doc) => {
        const result = await pdb.put(doc);
        return result;
      },
      search: async (query) => {
        query["limit"]=2000
        const results = await pdb.find(query);
        return results; // of the form {docs:[],...}
      },
      get: async (id) => {
        const data = await pdb.get(id);
        return data;
      },
      delete: async (id) => {
        const doc = await pdb.get(id);
        const resp = await pdb.remove(doc);
        return resp;
      },
      createIndex: async (filter) => {
        const data = await pdb.createIndex(filter);
        return data;
      },
    },
    utils: {
      encrypt: async (text, encryptionKey) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text); // Encode the text into bytes

        // Ensure the encryption key is of valid length (16, 24, or 32 bytes for AES-GCM)
        const keyBytes = encoder.encode(encryptionKey);
        if (
          keyBytes.length !== 16 &&
          keyBytes.length !== 24 &&
          keyBytes.length !== 32
        ) {
          throw new Error("Encryption key must be 16, 24, or 32 bytes long.");
        }

        // Convert encryptionKey to CryptoKey
        const key = await window.crypto.subtle.importKey(
          "raw",
          keyBytes,
          { name: "AES-GCM" },
          false,
          ["encrypt"]
        );

        // Create a random initialization vector (IV)
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

        // Encrypt the data
        const encrypted = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          data
        );

        // Convert encrypted data and IV to base64 for storage
        const encryptedArray = new Uint8Array(encrypted);
        const encryptedText = btoa(String.fromCharCode(...encryptedArray));
        const ivText = btoa(String.fromCharCode(...iv));

        return ivText + ":" + encryptedText; // Store IV and encrypted text together
      },
      decrypt: async (encryptedText, encryptionKey) => {
        const [ivText, encryptedData] = encryptedText.split(":");

        // Convert IV and encrypted data from base64 to byte arrays
        const iv = Uint8Array.from(atob(ivText), (c) => c.charCodeAt(0));
        const encryptedArray = Uint8Array.from(atob(encryptedData), (c) =>
          c.charCodeAt(0)
        );

        const encoder = new TextEncoder();

        // Convert encryptionKey to CryptoKey
        const key = await window.crypto.subtle.importKey(
          "raw",
          encoder.encode(encryptionKey),
          { name: "AES-GCM" },
          false,
          ["decrypt"]
        );

        // Decrypt the data
        const decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          encryptedArray
        );

        // Convert decrypted data back to a string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
      },
      ping: () => {
        // @TODO ping the database to check connectivity when class is ready to use
      },
      validate_schema: (schema_obj, data_obj) => {
        const ajv = new Ajv({code: {esm: true},strict:false,useDefaults:true}) // options can be passed, e.g. {allErrors: true}
        const data_copy = {...data_obj}
        const validate = ajv.compile(schema_obj);
        const valid = validate(data_copy);
        return {valid,validate,data:data_copy}
      },
    },
  };
  return doc_obj;
};

export const get_new_DB = (PouchDB,db) => {
  //console.log(db)
  if (!db.name) {
    throw new Error("No DB name was provided");
  }
  if (!db.encryption_key) {
    throw new Error("No encryption key was provided");
  }
  let doc_obj = get_pdb_doc(PouchDB,db.name, db.encryption_key);
  let database = new BeanBagDB(doc_obj);
  return database;
};

export const get_ready_DB = async (db) => {
  // this gives you a ready database instance. also making sure all ui settings are also done
  try {
    //console.log(db)
    let bbdb = get_new_DB(db);
    await bbdb.ready();
    if (bbdb.active) {
      await make_db_ui_ready(bbdb);
    }
    return bbdb;
  } catch (error) {
    throw error;
    console.log(error);
  }
};

const instance_check = (db) => {
  if (!(db instanceof BeanBagDB)) {
    throw new Error("BeanBagDB instance required");
  }
};

const ui_app = {
  meta: {
    name: "beanbagdb_ui",
    description: "Schemas required for the BeanBagDB UI",
  },
  schemas: [
  ],
  records: [],
};

const make_db_ui_ready = async (db) => {
  instance_check(db);
  try {
    let up = await db.initialize_app(ui_app);
    console.log(up);
  } catch (error) {}
};

export const destroy_db = (dbname) => {
  pdb = new window.PouchDB(dbname);

  // Destroy the database
  pdb
    .destroy()
    .then(() => {
      console.log("Database deleted successfully.");
    })
    .catch((err) => {
      console.error("Error deleting database:", err);
    });
}


export const sync_db_once = async (PouchDB,db)=>{
  try {
    if(!db.sync_url){
      throw new Error("No sync URL found")
    }
    const localDB  = new PouchDB(db.name);
    const remoteDB = new PouchDB(db.sync_url.trim()); 
    let sync_allowed = false
    let errors = []
    const mangoQuery = {
      selector: { "schema": "system_setting", "data.name":"beanbagdb_system"}, // Adjust this to match your settings docs
      limit: 100 // Adjust based on expected results
    };
    console.log(mangoQuery)
    const remoteSettingsResult = await remoteDB.find(mangoQuery);
    const remoteSettings = remoteSettingsResult.docs;
    console.log(remoteSettings)
    if (remoteSettings.length==0){
      // blank database
      // check if the database is blank
      let blank_check = await isRemoteDbBlank(remoteDB)
      if(blank_check){
        sync_allowed = true
      }else{
        errors.push("The selected remote database is not empty")
      }
      
    }else if (remoteSettings.length==1){
      console.log("one rec only")
      // only one setting doc must exist in the database 
      const localSettingsResult = await localDB.find(mangoQuery);
      const localSettings = localSettingsResult.docs[0];
      console.log("local=")
      console.log(localSettings)
      const remoteDoc = remoteSettings[0]
      console.log("remote=")
      console.log(remoteDoc)
      if(localSettings._id==remoteDoc._id && localSettings.meta.created_on == remoteDoc.meta.created_on ){
        sync_allowed = true 
      }else{
        sync_allowed = false
        errors.push("The remote database already contains another instance of bbdb. Once database can have a single bbdb instance in it. Use another remote DB")
      }

    }else{
      sync_allowed = false
      errors.push("The remote database already contains multiple setting document.Thus it cannot be used to sync this database")
    }
    //console.log
    //sync_allowed = false
    if(sync_allowed && errors.length==0){
      try {
        await new Promise((resolve, reject) => {
          localDB.sync(remoteDB, { live: false, retry: true })
            .on('complete', resolve)
            .on('error', reject);
        });
        return { success: true };
      } catch (syncError) {
        return { success: false, error: syncError.message };
      }
      // localDB.sync(remoteDB, {
      //   live: false,       // Enable live syncing
      //   retry: true       // Retry on failure
      // }).on('change', function (info) {
      //   console.log('Data changed:', info);
      // }).on('paused', function (err) {
      //   console.log('Replication paused:', err);
      // }).on('active', function () {
      //   console.log('Replication resumed.');
      // }).on('error', function (err) {
      //   console.error('Replication error:', err);
      // });
    }else{
      throw new Error(`Unable to sync. ${errors.join(".")} `)
    }
  } catch (error) {
    throw error
  }
}

async function isRemoteDbBlank(remoteDb) {
  try {
      const result = await remoteDb.allDocs({ limit: 1 });
      return result.rows.length === 0; // True if DB is empty
  } catch (error) {
      console.error("Error checking remote DB:", error);
      return false; // Assume not empty if error occurs
  }
}
