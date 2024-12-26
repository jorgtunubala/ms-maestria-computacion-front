import { Component, OnInit } from '@angular/core';
import { CertificadoVotacionService, CertificadoVotacion } from '../../services/certificado-votacion.service';
import { MessageService } from 'primeng/api';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tramite-certificado',
  templateUrl: './tramitecertificado.component.html',
  styleUrls: ['./tramitecertificado.component.scss'],
  providers: [MessageService]
})
export class TramiteCertificadoComponent implements OnInit {
  certificates: CertificadoVotacion[] = [];
  filteredCertificates: CertificadoVotacion[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  downloading: boolean = false;

  constructor(
    private certificadoService: CertificadoVotacionService,
    private messageService: MessageService
  ) {}

  hasApprovedCertificates(): boolean {
    return this.certificates.some(cert => cert.estado === 'Aprobada');
  }
 

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.certificadoService.obtenerCertificado().subscribe({
      next: (response) => {
        if (response) {
          this.certificates = response;
          this.filteredCertificates = response;
        } else {
          this.certificates = [];
          this.filteredCertificates = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los certificados'
        });
        this.certificates = [];
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  filterCertificates(): void {
    if (!this.searchTerm) {
      this.filteredCertificates = this.certificates;
      return;
    }
    
    this.filteredCertificates = this.certificates.filter(cert => 
      cert.id_Estudiante.toString().includes(this.searchTerm)
    );
  }

  actualizarEstado(certificado: CertificadoVotacion, nuevoEstado: string): void {
    const certificadoActualizado = {
      ...certificado,
      estado: nuevoEstado,
      fecha_modificacion: new Date().toISOString()
    };
  }

  downloadApprovedCertificates() {
    const approvedCerts = this.certificates.filter(cert => cert.estado === 'Aprobada');
    if (!approvedCerts.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay certificados aprobados para descargar'
      });
      return;
    }

    this.downloading = true; // Activar el indicador de descarga
    this.loading = true;
    this.certificadoService.downloadCertificado().subscribe({
      next: (blob: Blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `certificados_aprobados_${fecha}.zip`;
        saveAs(blob, fileName);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Certificados descargados correctamente'
        });
      },
      error: (error) => {
        console.error('Error al descargar los certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar los certificados'
        });
      },
      complete: () => {
        this.loading = false;
        this.downloading = false; // Desactivar el indicador de descarga
      }
    });
  }
  
}