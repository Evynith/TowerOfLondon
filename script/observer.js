'use strict';

class Observable {
    constructor() {
      this.observers = [];
    }
 
    // Add an observer to this.observers.
    addObserver(observer) {
      this.observers.push(observer);
    }
 
    // Remove an observer from this.observers.
    removeObserver(observer) {
      const removeIndex = this.observers.findIndex((obs) => {
        return observer === obs;
      });
 
      if (removeIndex !== -1) {
        this.observers = this.observers.slice(removeIndex, 1);
      }
    }
 
    notifyState(data) {
      if (this.observers.length > 0) {
        this.observers.forEach((observer) => observer.updateState(data));
      }
    }

    notifyMoving(data) {
        if (this.observers.length > 0) {
            this.observers.forEach((observer) => observer.updateMoving(data));
          }
    }
 }

 class Observer {
    // Gets called by the Subject::notify method.
    update() {}
  }

  export {Observable, Observer}