/* eslint-disable no-console */

const clearAPICache = () => {
  const keys = Object.keys(localStorage);
  const prefix = 'nm';
  console.warn('BEFORE:', keys);
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i].indexOf(prefix) === 0) {
      localStorage.removeItem(keys[i]);
    }
  }
  console.log('AFTER:', Object.keys(localStorage));
};

const util = (d) => {
  let o = 0;
  if (Array.isArray(d)) {
    o = d.reduce((sum, value) => Number(parseFloat(sum)) + Number(parseFloat(value)), 0);
    o = Number(parseFloat(o).toFixed(2));
  } else {
    o = Number(parseFloat(d).toFixed(2));
  }
  return o;
};

export const channelMap = (d) => {
  const ap = JSON.parse(window.localStorage.getItem('nuser')).p || 'NA';
  const data = d;
  if (ap === 'l') {
    if (!data.R) {
      data.R = util(data.c2);
      data.Y = util(data.c4);
      data.B = util(data.c6);
      data.i1 = util(data.c1);
      data.i2 = util(data.c3);
      data.i3 = util(data.c5);
    }
    if (data.R < 0) data.R = 0;
    if (data.Y < 0) data.Y = 0;
    if (data.B < 0) data.B = 0;

    if (data.i1 < 0) data.i1 = 0;
    if (data.i2 < 0) data.i2 = 0;
    if (data.i3 < 0) data.i3 = 0;
  } else {
    if (!data.R) {
      data.R = util(data.c2);
      data.Y = util(data.c3);
      data.B = util(data.c4);
      data.i1 = util(data.c1);
      data.i2 = util(data.c5);
      data.i3 = util(data.c6);
    }
    if (data.R < 0) data.R = 0;
    if (data.Y < 0) data.Y = 0;
    if (data.B < 0) data.B = 0;

    if (data.i1 < 0) data.i1 = 0;
    if (data.i2 < 0) data.i2 = 0;
    if (data.i3 < 0) data.i3 = 0;
  }
  return data;
};

const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

export const bkLog = log;
export default clearAPICache;
