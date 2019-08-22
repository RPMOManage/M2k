import { UserList } from '../user.model';

export class GetUserList {
  constructor(
    public Id: number,
    public Username: string,
    public Title: string,
    public information: UserList
  ) {}
}
