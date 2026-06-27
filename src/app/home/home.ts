import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'st-home',
  imports: [RouterLink, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
