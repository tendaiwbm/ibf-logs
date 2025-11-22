class ObjectUtils {
    static all_array_values_empty(object) {
        return Object.values(object)
                     .every(
                          (array) => array.length === 0 
                      )
    }

    static is_empty(object) {
        for (const key in object) {
            if (Object.hasOwn(object,key)) {
                return false;
            }
        }
        return true;
    }

    static empty(object) { 
        for (const key in object) {
            ObjectUtils.remove_item(object,key);
        }
        return object;
    }

    static remove_item(object,key) {
        delete object[key];
    }

    static upsert_item(object,key,value) {
        object[key] = value;
    }

    static upsert_items(object,params) {
        Object.keys(params)
              .forEach(
                   (key) => object[key] = params[key]
               )
    }

    static insert_array_value(object,key,value) {
        object[key].push(value);
    }

    static remove_array_value(object,key,value) {
        object[key] = object[key].filter(item => item != value);
    }
}

export function deepCopyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

export function update_state(state_manager,param_dict) {
    ObjectUtils.upsert_items(state_manager,param_dict);
}

function updatePageState(param_dict) {
    ObjectUtils.upsert_items(PageState,param_dict);
}