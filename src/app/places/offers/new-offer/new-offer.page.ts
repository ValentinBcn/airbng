import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  today = new Date().toISOString();
  constructor(private placeService: PlacesService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(
        (new Date()).toISOString(),
        {
        updateOn: 'blur',
        validators: [Validators.required]
      }),

      dateTo: new FormControl({

        updateOn: 'blur',
        validators: [Validators.required],
      })

    });
  }

  onCreateOffer() {
    if (!this.form.valid) {
      return;
    }
    console.log('on est la', this.form);
    this.loadingCtrl.create({
      message: 'Creating place ...'
    }).then(loadedEl => {
      loadedEl.present();
      this.placeService.addPlace(this.form.value.title,
        this.form.value.description,
        +this.form.value.price,
        new Date(this.form.value.dateFrom),
        new Date(this.form.value.dateTo)
      ).subscribe(() => {
        loadedEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    });


  }

}
