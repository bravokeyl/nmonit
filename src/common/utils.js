const clearAPICache = () => {
  let keys = Object.keys(localStorage);
  let prefix = "nm";
  console.warn("BEFORE:",keys);
  for(let i=0;i<keys.length;i++){
    if (keys[i].indexOf(prefix) === 0) {
        localStorage.removeItem(keys[i]);
    }
  }
  console.warn("AFTER:",Object.keys(localStorage));
};
export default clearAPICache;
