import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nombre-del-componente1',
  templateUrl: './nombre-del-componente1.component.html',
  styleUrls: ['./nombre-del-componente1.component.scss']
})
export class NombreDelComponente1Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  sehizoclick(){
    console.log("hola");
  }

}
