export abstract class EventHandler {
  protected nextHandler?: EventHandler;

  public setNext(nextHandler: EventHandler) {
    this.nextHandler = nextHandler;
    return this.nextHandler;
  }

  public async handleEvent(eventType: string, event: any) {
    if (this.nextHandler != null)
      await this.nextHandler.handleEvent(eventType, event);
  }
}
