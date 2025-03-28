const install_default_records = async (instance, required_docs) => {
  let keys = Object.keys(required_docs);
  for (let index = 0; index < keys.length; index++) {
    const element = required_docs[keys[index]];
    try {
      let doc = await instance.read(element.search_criteria);
    } catch (error) {
      console.log(error.message);
      //if(error.message.)
      
      if (error.message.startsWith("Error in fetching document.")) {
        console.log("creating a new doc")
        let new_doc = await instance.create(element.new_data);
        
      }
    }
  }
};

export const plugins = { install_default_records };
