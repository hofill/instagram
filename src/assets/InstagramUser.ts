export class UserData {
  username: string;
  cookies: Record<string, unknown>[];
  unfollowed: Follower[];
  constructor(username: string, cookies: Record<string, unknown>[], unfollowed:Follower[]) {
    this.username = username;
    this.cookies = cookies;
    this. unfollowed = unfollowed;
  }

  applySelf(json: JSON): void {
    Object.assign(this, json);
  }
}

export class Follower {
  username: string;
  full_name: string;
  follows: boolean;
  liked_pictures: number[];
  commented_on: number[];
  constructor(username: string, full_name: string, follows: boolean, liked_pictures: number[], commented_on: number[]) {
    this.username = username;
    this.full_name = full_name;
    this.follows = follows;
    this.liked_pictures = liked_pictures;
    this.commented_on = commented_on;
  }
}
