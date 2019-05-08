import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  constructor(private authService: AuthService, private router: Router, private loadCtrl: LoadingController) { }

  ngOnInit() {
  }

  onLogin() {
    this.isLoading = true;
    this.authService.login();

    this.loadCtrl.create({keyboardClose: true, message: 'Logging in ...'})
      .then(loadEl => {
        loadEl.present();
        setTimeout( () => {
          this.isLoading = false;
          loadEl.dismiss();
          this.router.navigateByUrl('/places/tabs/discover');
        }, 1500);
      });

  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    if (this.isLogin) {
      // login
    } else {
      // sign up
    }
    console.log('form', form);
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

}
