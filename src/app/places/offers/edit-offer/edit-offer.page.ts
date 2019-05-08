import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup;
  isLoading = false;
  placeId: string;
  private placeSub: Subscription;
  constructor(private route: ActivatedRoute, private placesService: PlacesService,
    private navCtrl: NavController, private router: Router, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.initiateForm(place);
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'error occured', message: 'Place could not be found',
          buttons: [{
            text: 'ok', handler: () => {
              this.router.navigate(['/places/tabs/offers']);
            }
          }]
        })
        .then( alertEl => {
            alertEl.present();
          });
      });
    });

  }

  initiateForm(place: Place) {
    this.form = new FormGroup({
      title: new FormControl(place.title, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(place.description, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(place.price, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      // dateFrom: new FormControl(null, {
      //   updateOn: 'blur',
      //   validators: [Validators.required]
      // }),
      // dateTo: new FormControl(null, {
      //   updateOn: 'blur',
      //   validators: [Validators.required]
      // }),
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating place'
    }).then(elCreated => {
      elCreated.present();
      this.placesService.updatePlace(this.place.id, this.form.value.title, this.form.value.description)
        .subscribe(() => {
          elCreated.dismiss();
          this.form.reset();
          this.router.navigate(['/places/tabs/offers']);
        });
    });

    console.log(this.form);
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
