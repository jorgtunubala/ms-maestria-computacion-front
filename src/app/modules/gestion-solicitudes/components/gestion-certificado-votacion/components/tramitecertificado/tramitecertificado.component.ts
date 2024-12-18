import { Component, OnInit } from '@angular/core';
import { GestorService } from '../../../../services/gestor.service'; // Asegúrate de tener la ruta correcta
import { SolicitudRecibida } from '../../../../models/indiceModelos'; // Ajusta el modelo según corresponda

@Component({
  selector: 'app-tramite-certificado',
  templateUrl: './tramitecertificado.component.html',
  styleUrls: ['./tramitecertificado.component.scss']
})
export class TramiteCertificadoComponent implements OnInit {
  certificates: SolicitudRecibida[] = []; // Almacenará los datos para la tabla
  loading: boolean = false; // Para indicar estado de carga

  constructor(private gestorService: GestorService) {}

  ngOnInit(): void {
    this.loadCertificates(); // Cargar los datos al iniciar
  }

  loadCertificates(): void {
    this.loading = true;
    const correoUsuario = 'usuario@ejemplo.com'; // Reemplazar con el valor adecuado

    this.gestorService.obtenerSolicitudesTutorDirector(correoUsuario).subscribe({
      next: (data: SolicitudRecibida[]) => {
        this.certificates = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los certificados:', error);
        this.loading = false;
      }
    });
  }
}
