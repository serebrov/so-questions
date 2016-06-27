import {Component, OnInit}              from '@angular/core';
import { Router, ActivatedRoute }       from '@angular/router';

@Component({
  selector: 'home',
  template: '<h1>Home: {{country}}</h1>'
})

export class HomeComponent implements OnInit {

  country: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router) {

    this.country = '?';

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       let country = params['country'];
       this.country = country;
       console.log(country);
     });
  }


}
