import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { List } from './models/list.model';
import { Task } from './models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }
  
  createTask(title: string, listId: string) {
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }

  updateTask(listId: string, taskId: string, title: string) {
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }

  createList(title: string) {
    //We want to send a web request to create a list
    return this.webReqService.post('lists', { title });
  }

  updateList(id: string, title: string) {
    //We want to send a web request to update a list
    return this.webReqService.patch(`lists/${id}`, { title });
  }

  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }

  deleteTask(listId: string, taskId: string) {
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  getLists() {
    return this.webReqService.get('lists');
  }

  getTasks(listId: string) {
    return this.webReqService.get(`lists/${listId}/tasks`)
  }

  complete(task: Task) {
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }
}
