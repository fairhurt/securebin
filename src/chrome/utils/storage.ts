// constant keys for accessing storage
import { Storage } from '../../constants'


export const setItem = (key: string, value: any, callback?: () => void) => {
    chrome.storage.sync.set({ [key]: value }, callback)
}

export const getItem = (key: string | string[] | null, callback: (items: { [key: string]: any; }) => void) => {
    return chrome.storage.sync.get(key, callback)
}

export const getItemAtIndex = (key: string, index: number, callback: (items: { [key: string]: any; }) => void) => {
    getItem(key, (data) => {
        const result = data[key];
        if (result && result.length > index) {
            return result[index]
        }
    })
}

export const addItem = (key: string, value: any, callback?: () => void) => {
    getItem(key, (data) => {
        //console.log("DATA FROM ADD", data);
        let result = data[key];
        if(!result) {
            result = [];
        }
        result.push(value);
        //console.log("ADDING ITEM", value)
        //console.log("RESULTING VALUE", result)
        setItem(key, result)
    })
}

export const removeItem = (key: string, value: any, index: number, callback?: () => void) => {
    getItem(key, (data) => {
        let result = data[key];
        if(result && result.length > index) {
            result.splice(index, 1);
        }
        return chrome.storage.sync.set({ [key]: result }, callback)
    })
}

export const clearItems = (key: string, value: any, callback?: () => void) => {
    return chrome.storage.sync.set({ [key]: [] }, callback)
}


export const getItemAsync = async (key: string) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], function (result) {
        if (result[key] === undefined) {
          console.log(`${key} not found`)
          resolve(undefined)
        } else {
          resolve(result[key]);
        }
      });
    });
  };

export const deleteItem = (key: string | string[], callback?: () => void) => {
    return chrome.storage.sync.remove(key, callback)
}