import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit{

  listId!: string;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {
    
  }

  

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId'];
      }
    )
  }

  createTask(title: string) {
    console.log('Ovo je listId ' + this.listId);
    this.taskService.createTask(title, this.listId).subscribe(next=>{
      const task: Task = next as Task;
      console.log(task);
      this.router.navigate(['../'], {relativeTo: this.route});
    });

    
  }

}
