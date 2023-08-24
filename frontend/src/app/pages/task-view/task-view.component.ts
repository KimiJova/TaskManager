import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: any;
  tasks: any;
  selectedListId: any;
  
  constructor(private taskService: TaskService, private route: ActivatedRoute, private elRef: ElementRef, 
    private router: Router, private authService: AuthService) { }

  ngOnInit() {
    console.log('TaskViewComponent initialized');
  
    this.route.params.subscribe((params: Params) => {
      this.selectedListId = params['listId'];
  
      if (this.selectedListId) {
        console.log('Fetching tasks for list:', this.selectedListId);
        this.taskService.getTasks(this.selectedListId).subscribe((tasks: any) => {
          this.tasks = tasks;
          console.log('Fetched tasks:', this.tasks);

          const taskListContainer = this.elRef.nativeElement.querySelector('.task-list');
      if (taskListContainer) {
        const taskCount = tasks.length;
        const taskHeight = 500; // Adjust the task height as needed
        const maxContainerHeight = 500; // Adjust the maximum container height as needed
        const calculatedHeight = Math.min(taskCount * taskHeight, maxContainerHeight);
        taskListContainer.style.maxHeight = calculatedHeight + 'px';
      }
        });
      }
  
      this.taskService.getLists().subscribe((lists: any) => {
        this.lists = lists;
        console.log('Fetched lists:', this.lists);
      });
    });
  }
  

  onTaskClick(task: Task)  {
    //We want to set the task to completed
    this.taskService.complete(task).subscribe(()=>{
      console.log("Completed successfully");
      // the task has been set to completed successfully
      task.completed = !task.completed;
    });
  }

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any)=>{
      this.router.navigate(['/lists'])
      console.log(res)
    });
  }

  onDeleteTaskClick(id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any)=>{
      //this.router.navigate(['/lists'])
      this.tasks = this.tasks.filter((val: { _id: string; }) => val._id !== id);
      console.log(res)
    });
  }

  onLogoutClick() {
    this.authService.logout();
  }



  

}
