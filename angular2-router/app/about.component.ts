import {Component, OnInit}              from '@angular/core';
import { Router, ActivatedRoute }       from '@angular/router';

@Component({
  selector: 'about',
  template: '<h1>About: {{country}}</h1>'
})

export class AboutComponent implements OnInit {

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
