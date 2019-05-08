import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  loadedBookingSub: Subscription;
  isLoading = false;
  constructor(private bookingsService: BookingsService,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.loadedBookingSub = this.bookingsService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

  onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({message: 'Canceling...'}).then(loadEl => {
      loadEl.present();
      this.bookingsService.cancelBooking(bookingId).subscribe(() => {
        loadEl.dismiss();
      });
    });
    // cancel booking with id
  }

  ngOnDestroy() {
    if (this.loadedBookingSub) {
      this.loadedBookingSub.unsubscribe();
    }
  }

}
