import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  //   // tslint:disable-next-line:max-line-length
  // tslint:disable-next-line:max-line-length
  //   new Place('p1', 'Guiscriff', 'en bretagne', './assets/img/city-street.jpg', 250.52, new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  //   // tslint:disable-next-line:max-line-length
  // tslint:disable-next-line:max-line-length
  //   new Place('p2', 'Lorient', 'en bretagne', './assets/img/new-york-city.jpg', 149.99, new Date('2019-05-01'), new Date('2019-11-31'), 'xyz'),
  //   // tslint:disable-next-line:max-line-length
  // tslint:disable-next-line:max-line-length
  //   new Place('p3', 'Brest', 'en bord de mer', './assets/img/pexels-photo-2.jpeg', 199.99, new Date('2019-02-01'), new Date('2019-08-31'), 'abc')

  // ]
  private _places = new BehaviorSubject<Place[]>([]);
  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>('https://ng-bnb-7cb1e.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {


          if (resData.hasOwnProperty(key)) {
            places.push(new Place(key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId,
            ));
          }
        }
        return places;
      }),
        tap(places => {
          this._places.next(places);
        })
      );
  }
  get places() {
    return this._places.asObservable();
  }


  getPlace(id: string) {
    console.log('tu veux', id);
    return this.http.get<PlaceData>('https://ng-bnb-7cb1e.firebaseio.com/offered-places/' + id + '.json')
      .pipe(map(res => {
        console.log(res);
        return new Place(id,
            res.title,
            res.description,
            res.imageUrl,
            res.price,
            new Date(res.availableFrom),
            new Date(res.availableTo),
            res.userId);
      }));
    // return this.places.pipe(take(1), map(places => {
    //   return { ...places.find(p => p.id === id) };
    // }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(Math.random().toString(),
      title,
      description,
      // tslint:disable-next-line:max-line-length
      'https://images.unsplash.com/photo-1533254378180-a895beb2cdfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
      price, dateFrom, dateTo, this.authService.userId
    );
    let generatedId: string;
    return this.http
      .post<{ name: string }>('https://ng-bnb-7cb1e.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })

      );
    // return this.places.pipe(take(1), delay(1000), tap( places => {
    //       this._places.next(places.concat(newPlace));
    //   })
    // );

  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }}),
        switchMap(places => {
          const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
          updatedPlaces = [...places];
          const oldPlace = updatedPlaces[updatedPlaceIndex];
          console.log('tu va modifier', updatedPlaces[updatedPlaceIndex], title, description);

          updatedPlaces[updatedPlaceIndex] = new Place(
            oldPlace.id,
            title,
            description,
            oldPlace.imageUrl,
            oldPlace.price,
            oldPlace.availableFrom,
            oldPlace.availableTo,
            oldPlace.userId
          );
          return this.http.put('https://ng-bnb-7cb1e.firebaseio.com/offered-places/' + placeId + '.json',
            { ...updatedPlaces[updatedPlaceIndex], id: null }
          );
        }),
        map(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

}
