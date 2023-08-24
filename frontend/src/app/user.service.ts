import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private webService: WebRequestService) { }

  getUsers() {
    return this.webService.getUsers();
  }

  deleteUser(userId: string) {
    return this.webService.deleteUser(userId);
  }
}
