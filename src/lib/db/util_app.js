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
    },
    graph_settings:{
      new_data: {
        schema: "system_setting",
        data: {
          name:"graph_frontend",
          value:{
            "nodes" : {
              "default":{
                "background":"#424649",
                "color":"#fff",
                "fontsize":"15px"
              }
            },
            "edges":{
              "default":{
                "color":"#666"
              }
            }
          }
        },
        meta: {
          title: "Graph frontend settings"
        },
        ref: {
          ver: 1,
          app: app_name
        },
      },
      search_criteria: {
        schema: "system_setting",
        data: { name: "graph_frontend" },
      }
    }
},
  setting_schema:{
    graph_frontend: {
      "type": "object",
      "title": "Edit graph frontend setting",
      "description": "",
      "properties": {
        "name": {
          "type": "string",
          "readOnly": true
        },
        "value": {
          "type": "object",
          "properties": {
            "nodes": {
              "type": "object",
              "patternProperties": {
                "^[a-zA-Z0-9_]+$": {
                  "type": "object",
                  "properties": {
                    "color": {
                      "type": "string",
                      "pattern": "^#[0-9A-Fa-f]{6}$",
                      "format":"color",
                      "default":"#fff"
                    },
                    "background": {
                      "type": "string",
                      "pattern": "^#[0-9A-Fa-f]{6}$",
                      "format":"color",
                      "default":"#424649"
                    },
                    "fontsize":{
                      "type":"string",
                      "default":"15px"
                    }
                  },
                  "required": ["color","background","fontsize"],
                  "additionalProperties": true
                }
              },
              "additionalProperties": true
            },
            "edges": {
              "type": "object",
              "patternProperties": {
                "^[a-zA-Z0-9_]+$": {
                  "type": "object",
                  "properties": {
                    "color": {
                      "type": "string",
                      "pattern": "^#[0-9A-Fa-f]{6}$",
                      "format":"color"
                    }
                  },
                  "required": ["color"],
                  "additionalProperties": true
                }
              },
              "additionalProperties": true
            }

          },
          "required": ["nodes","edges"],
          "additionalProperties": true
        }
      },
      "required": ["name", "value"],
      "additionalProperties": false
    }
  },
  schemas: [],
};
