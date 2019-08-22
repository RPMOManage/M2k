import { GetUserList } from './getUser.model';

export class SiteGroupsList {
  constructor(
    public Id: number,
    public LoginName: string,
    public Title: string,
    public Users: GetUserList[]
  ) {}
}
