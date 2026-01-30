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
export {
  Queue
};
