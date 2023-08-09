import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[] = [];
  tasks: Task[] = [];
  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(){
    this.route.params.subscribe(
      (params: Params) => {
        const listId = params['listId'];
        this.taskService.getTasks(listId).subscribe((tasks: any)=>{
          this.tasks = tasks;
        })
      }
    )

    this.taskService.getLists().subscribe((lists: any)=>{
      this.lists = lists;
    })
  }

  onTaskClick(task: Task)  {
    //We want to set the task to completed
    this.taskService.complete(task).subscribe(()=>{
      console.log("Completed successfully");
      // the task has been set to completed successfully
      task.completed = !task.completed;
    });
  }

  

}
