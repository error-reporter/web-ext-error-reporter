const CreateLocalStorage = function CreateLocalStorage(prefix) {

  return function state(originalKey, value) {

    const key = prefix + originalKey;
    if (value === null) {
      return window.localStorage.removeItem(key);
    }
    if (value === undefined) {
      const item = window.localStorage.getItem(key);
      return item && JSON.parse(item);
    }
    if (value instanceof Date) {
      throw new TypeError('Converting Date format to JSON is not supported.');
    }
    window.localStorage.setItem(key, JSON.stringify(value));

  };

};
export default CreateLocalStorage;
