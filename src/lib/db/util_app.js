// the app object 
import { plugins } from "./dbutils.js";
import { text_command } from "./textcommand.js";
let app_name = "bbdb_util_app"
export const app = {
  app_id: app_name,
  meta: {
    description: "This is a util app installed by default for the frontend",
    name: app_name,
  },
  home: {},
  ui_components: {},
  custom_editors: {},
  scripts: {
    ...plugins,
    ...text_command
  },
  default_records: {
    recent_doc_search_script:{
      new_data: {
        schema: "system_script",
        data: {
          "type":"search_query",
          "name":"recent-doc-search-script",
          "version":1,
          "log_execution":false,
          "usage": " You can enter since how many hours in the past you want to fetch documents",
          "script":`let last_hour=6;
if(input){last_hour = parseInt(input) }
let past_time = Math.floor((Date.now() - last_hour * 60 * 60 * 1000) / 1000); let query = {  "$or": [{ "meta.created_on": { "$gt": past_time } },{ "meta.updated_on": { "$gt": past_time } }]  };return {query}`
        },
        meta: {
          title: "Load recent documents"
        },
        ref: {
          ver: 1,
          app: app_name
        },
      },
      search_criteria: {
        schema: "system_script",
        data: { name: "recent-doc-search-script" },
      }
    }
},
  setting_schema:{},
  schemas: [],
};
