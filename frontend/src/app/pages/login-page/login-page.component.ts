// login-page.component.ts
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password).subscribe(
      (res: any) => {
        if (res.body.isAdmin === true) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/lists']);
        }
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }
  
  
}
