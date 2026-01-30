"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var queue_exports = {};
__export(queue_exports, {
  Queue: () => Queue
});
module.exports = __toCommonJS(queue_exports);
class Queue {
  constructor(delayMs = 1e3) {
    this.lastRequestTime = null;
    this.requestQueue = [];
    this.processing = false;
    this.delayMs = delayMs;
  }
  async enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ fn, resolve, reject });
      if (!this.processing) {
        this.processNext();
      }
    });
  }
  processNext() {
    if (this.requestQueue.length === 0) {
      this.processing = false;
      return;
    }
    this.processing = true;
    if (this.lastRequestTime !== null) {
      const elapsed = Date.now() - this.lastRequestTime;
      const waitTime = this.delayMs - elapsed;
      if (waitTime > 0) {
        setTimeout(() => this.executeNextRequest(), waitTime);
      } else {
        this.executeNextRequest();
      }
    } else {
      this.executeNextRequest();
    }
  }
  executeNextRequest() {
    const item = this.requestQueue.shift();
    if (!item) {
      this.processing = false;
      return;
    }
    const { fn, resolve, reject } = item;
    fn().then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    }).finally(() => {
      this.lastRequestTime = Date.now();
      this.processNext();
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Queue
});
