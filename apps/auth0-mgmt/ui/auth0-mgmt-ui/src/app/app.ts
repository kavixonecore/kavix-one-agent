import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { TopbarComponent } from "./shared/components/topbar/topbar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TopbarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {}
