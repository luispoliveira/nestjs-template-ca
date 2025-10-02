export class ConflicError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = ConflicError.name;
  }
}
