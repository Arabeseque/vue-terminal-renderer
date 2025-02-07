// event.js
export class Event {
  constructor(type) {
    this.type = type;
    this.defaultPrevented = false;
    this.timeStamp = Date.now();
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }
}
