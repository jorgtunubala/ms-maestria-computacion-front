import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { ExpertoService } from '../../services/experto.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Experto } from '../../models/experto';

@Component({
  selector: 'app-crear-editar-experto',
  templateUrl: './crear-editar-experto.component.html',
  styleUrls: ['./crear-editar-experto.component.scss']
})
export class CrearEditarExpertoComponent implements OnInit {

  loading: boolean;
  editMode: boolean;
  form: FormGroup;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private expertoService: ExpertoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router:Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit():void {
    this.initForm();
    if(this.router.url.includes('editar')){
      this.enableEditMode();
    }
    this.setBreadcrumb();
  }

  setBreadcrumb(){
    this.breadcrumbService.setItems([
      { label: 'Gestión' },
      { label: 'Expertos', routerLink:'expertos' },
      { label: this.editMode ? 'Editar' : 'Registrar' },
    ]);
  }

  enableEditMode(){
    this.editMode = true;
    this.loadExperto();
  }

  loadExperto(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.expertoService.getExperto(id).subscribe({
      next: (response) => this.setValuesForm(response),
    });
  }

  setValuesForm(experto:Experto){
  }

  initForm():void{
    
  }

}
