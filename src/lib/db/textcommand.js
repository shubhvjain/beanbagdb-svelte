// plugin for text commands for web based ui and database exploration 

const parse_params_string = (param)=>{
  // must be of the type param1=value1,params2=value2
  let splits = param.split(",")
  let data = {}
  splits.forEach(split=>{
    let s = split.split("=")
    if (s.length==2){
      data[s[0]] = s[1]
    }
  })
  return data
}

const commands = {
  new: {
    parse: async (instance,parts) => {
      let criteria = {}
      criteria.schema = parts.length==0?"":parts.join("")
      return criteria
    },
    run: async (instance,command) => {
      if (command.criteria.schema==""){
        // return a list of all schemas present in the DB
        let all_schema = await instance.get("schema_list")
        return all_schema
      }else{
        // return the schema object for the given schema if not found throw error
        let schema_obj = await instance.search({"selector":{"schema":"schema","data.name":command.criteria.schema}})
        //console.log(schema_obj)
        if(schema_obj.docs.length==0){
          throw new Error("Schema with this name does not exists")
        }
        return schema_obj.docs
      }
    },
    help: `To create a new record. Format : new/"schema_name(optional)". If no schema name provided, a list of valid schema name is returned`
  },
  open:{
    parse: async (instance,parts) => {
      let criteria = {}
      if (parts.length==0){
        throw new Error("Invalid arguments.open command needs unique id")
      }
      let id_type = parts[0]
      if(id_type=="id"){
        parts.shift()
        criteria["_id"] = parts.join("")
      }else if(id_type=="link"){
        parts.shift()
        criteria["link"] = parts.join("")
      }else if(id_type=="key"){
        parts.shift()
        let text= parts.join()
        let p = text.split(",")

        p.map(itm=>{
          let p1 = itm.split("=")
          if(p1[0]=="schema"){
            criteria["schema"] = p1[1]
          }else{
            criteria["data"][p1[0]] = p1[1]
          }
        })

        if(!criteria["schema"]){
          throw new Error("Key requires a schema")
        }
      }else{
        throw new Error("Invalid unique key")
      }
      return criteria
    },
    run: async (instance,command) => {
      try {
        let data = await instance.read(command.criteria,true)  
        return data
      } catch (error) {
        throw error
      }      
    },
    help: `To open a record using it's unique id. Format : open/"id||link|key"/"value". In case of key field name must be provided  as : field1=value1,fields2=value2...`
  },
  page:{
    parse : async (instance,parts)=>{
      let criteria = {params : {}}
      let qsplit = parts.join().split("?")
      if(qsplit.length>1){criteria.params = parse_params_string(qsplit[1])}
      criteria.type = qsplit[0]
      let valid_type = ["info","plugins","settings","keys","help","schemas","search"]
      if(!valid_type.includes(criteria.type)){
        throw new Error(`Invalid page type. Valid pages : ${valid_type.join(",")}`)
      }
      return criteria
    },
    run : async (instance,command)=>{
      let c_type = command.criteria.type
      if (c_type=="info"){
        // to get all basic info about the database
        let data = {
          meta: instance.metadata(),
          schemas : {},
          logs:[]
        }
        try {
          let schemas = await instance.get("schema_list") 
          data.schemas = schemas
          let logs_doc = await instance.search({"selector":{"schema":"system_log"}})
          data.logs = logs_doc.docs          
        } catch (error) {
          console.log(error)
        }

        return data

      }else if(c_type=="plugins"){
        // to show list of all plugins installed
        // todo later not implemented yet 
      }else if(c_type=="settings"){
        // to show the list of all setting docs available 
        let search = await instance.search({"selector":{"schema":"system_setting"}})
        let setting_docs = []
        //console.log(search)
        search.docs.forEach(itm=>{
          setting_docs.push({name:itm.data.name,link:itm.meta.link,value:JSON.stringify(itm.data.value,null,1)})
        })
        return {docs:setting_docs}
      }
      else if(c_type=="keys"){
        // to show the list of all keys present in the db 
        let search = await instance.search({"selector":{"schema":"system_key"}})
        console.log(search)
        let keys = []
        search.docs.forEach(itm=>{
          keys.push({name:itm.data.name,note:itm.data.note,link:itm.meta.link})
        })
        return {docs:keys}
      }
      else if(c_type=="schemas"){
        // to show the list of all keys present in the db 
        let data = {}
        try {
          let docs = await instance.get("schema_list") 
          data.docs = docs
          let schema_schema = docs.find(item=>{return item.name=="schema"})
          //console.log(schema_schema)
          data.schema = schema_schema
        } catch (error) {
          console.log(error)
        }
        return data
      }
      else{
        throw new Error("Invalid tool command")
      }
    },
  },
  home:{
    parse:async(instance,parts)=>{
      return {}
    },
    run:async(instance,command)=>{
      return {}
    }
  },
  ui:{
    parse:async(instance,parts)=>{
      if (parts.length==0){
        throw new Error("Invalid arguments.ui command needs a page name")
      }
      return {page_key:parts.join()}
    },
    run:async(instance,command)=>{
      return command
    } 
  }
};

const parse = async (instance, text) => {
  let data = {
    errors: [],
    valid: false,
    name: "",
    criteria: {},
  };
  if (!text) {
    data.errors.push(
      "No text command provided. Format : command_name/parameter"
    );
  }
  let parts = text.split("/");
  if (parts.length == 0) {
    data.errors.push("Invalid text command");
  }
  let command_name = parts[0];
  if (!commands[command_name]) {
    data.errors.push(
      "Invalid command name. Valid : " + Object.keys(commands).join(",")
    );
  }
  data.name = command_name;
  try {
    parts.shift();
    let criteria = await commands[command_name].parse(instance,parts);
    data.criteria = criteria;
  } catch (error) {
    data.errors.push(error.message);
  }
  if (data.errors.length == 0) {
    data.valid = true;
  }
  return data;
};

const run = async (instance, command) => {
  let data = {
    result:{},
    errors:[],
    valid:false
  };

  if (!command) {
    data.errors.push("No command object provided ");
  }
  if (!command.valid){
    data.errors["Command cannot be run"]
    
  }
  if(!commands[command.name]){
    data.errors["Invalid command name"]
  }

  try {
    let data1 = await commands[command.name].run(instance,command)
    //console.log(data)
    data.result = data1
  } catch (error) {
    data.errors.push(error.message)
  }
  if(data.errors.length==0){
    data.valid = true
  }
  return data
};

const parse_and_run = async(instance, text) => {
  let command = await parse(instance,text)
  //console.log(command)
  let command_result = await run(instance,command)
  return command_result
}
// const schemas =    []

export const text_command = {
  actions: {parse,run,parse_and_run}
};