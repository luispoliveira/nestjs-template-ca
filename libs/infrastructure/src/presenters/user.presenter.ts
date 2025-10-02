import { UserOutputDTO } from '@lib/application';

export class UserPresenter {
  id: number;
  email: string;

  constructor(output: UserOutputDTO) {
    this.id = output.id;
    this.email = output.email;
  }
}
