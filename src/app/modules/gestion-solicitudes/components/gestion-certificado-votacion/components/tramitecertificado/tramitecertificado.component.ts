import { Component, OnInit } from '@angular/core';
import { CertificadoVotacionService, CertificadoVotacion, AcademicPeriod } from '../../services/certificado-votacion.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tramite-certificado',
  templateUrl: './tramitecertificado.component.html',
  styleUrls: ['./tramitecertificado.component.scss'],
  providers: [MessageService],
})

export class TramiteCertificadoComponent implements OnInit {
  certificates: CertificadoVotacion[] = [];
  filteredCertificates: CertificadoVotacion[] = [];
  academicPeriods: { label: string; value: string }[] = [];
  selectedPeriod: AcademicPeriod | null = null;
  latestPeriodLabel: string = 'Seleccionar Período';
  searchTerm: string = '';
  loading: boolean = false;
  downloading: boolean = false;
  originalPeriodData: any[] = [];
  isUpdating: boolean = false;

  constructor(
    private certificadoService: CertificadoVotacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  hasApprovedCertificates(): boolean {
    return this.certificates.some(cert => cert.estado === 'Aprobada');
  }

  ngOnInit(): void {
    this.loadCertificates();
  }   
  
  loadCertificates(callback?: () => void): void {
    this.loading = true;
    this.certificadoService.obtenerCertificado().subscribe({
      next: (response) => {
        this.certificates = response || [];
        this.filteredCertificates = [...this.certificates];
        this.loading = false;
  
        // Llamar al callback si existe
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los certificados',
        });
        this.certificates = [];
        this.loading = false;
      },
    });
  }  

  filterCertificates(): void {
    let filtered = this.certificates;
  
    // Primero aplicamos el filtro por período si hay uno seleccionado
    if (this.selectedPeriod) {
      const studentIdsForPeriod = this.originalPeriodData
        .filter(item => item.fecha_ingreso === this.selectedPeriod?.value)
        .map(item => item.id);
  
      filtered = filtered.filter(cert => 
        studentIdsForPeriod.includes(cert.id_Estudiante)
      );
    }
  
    // Luego aplicamos el filtro por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter((cert) =>
        cert.id_Estudiante.toString().includes(this.searchTerm.trim())
      );
    }
  
    this.filteredCertificates = filtered;
  
    if (filtered.length === 0 && (this.searchTerm || this.selectedPeriod)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin resultados',
        detail: 'No se encontraron certificados con los filtros aplicados'
      });
    }
  }

  filterByPeriod(): void {
    this.filterCertificates();
  }
  /*
  descargarcertificados(){      
    this.filterCertificates();
  
    const approvedCerts = this.filteredCertificates.filter(cert => cert.estado === 'Aprobada');
    const estudianteActivo = this.filteredCertificates.filter(cert => cert.estadoEstudiante === 'ACTIVO');

    if (!approvedCerts.length && estudianteActivo.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `No hay certificados aprobados para el período`,
      });
      return;
    }
  
    this.downloading = true;
    this.loading = true;
  
    const estado = estudianteActivo
    const approvedIds = approvedCerts
    this.certificadoService.downloadCertificado({
      estado_estudiante: estado,
      certificateIds: approvedIds, 
    }).subscribe({
      next: (blob: Blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `certificados_aprobados_${fecha}.zip`;
  
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
  
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Certificados descargados correctamente',
        });
      },
      error: (error) => {
        console.error('Error al descargar los certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar los certificados: ' + error.message,
        });
      },
      complete: () => {
        this.loading = false;
        this.downloading = false;
      },
    });
  }
    */

  // Descargar certificados aprobados
  downloadApprovedCertificates() {  
    if (!this.selectedPeriod || !this.selectedPeriod.value) {
      console.warn("⚠️ Intento de descargar sin un período válido.");
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se ha seleccionado un período válido',
      });
      return;
    }
    
    this.filterCertificates();
  
    const approvedCerts = this.filteredCertificates.filter(cert => cert.estado === 'Aprobada');
    const estudianteActivo = this.filteredCertificates.filter(cert => cert.estadoEstudiante === 'ACTIVO');

    if (!approvedCerts.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `No hay certificados aprobados para el período`,
      });
      return;
    }
  
    this.downloading = true;
    this.loading = true;
  
    const period = this.selectedPeriod.value;  
    const approvedIds = approvedCerts
      .map(cert => cert.id_Certificado)
      .filter(id => id != null)
      .map(id => parseInt(id));
    
    this.certificadoService.downloadCertificado({
      estado_estudiante: period,
      certificateIds: approvedIds,
    }).subscribe({
      next: (blob: Blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `certificados_aprobados_${period}_${fecha}.zip`;
  
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
  
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Certificados descargados correctamente',
        });
      },
      error: (error) => {
        console.error('Error al descargar los certificados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar los certificados: ' + error.message,
        });
      },
      complete: () => {
        this.loading = false;
        this.downloading = false;
      },
    });
  }  

  expireCertificates(): void {
    if (this.isUpdating) return; // Evitar ejecuciones repetidas
    this.isUpdating = true;
  
    if (this.filteredCertificates.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No hay certificados para vencer.' });
      this.isUpdating = false;
      return;
    }
  
    // Solo necesitamos hacer una llamada ya que vencemos todos los certificados
    const body = { codigo: '32', estado: 'vencido' };
  
    this.certificadoService.actualizarEstadoSolicitud(body).subscribe({
      next: (response) => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: 'Todos los certificados han sido vencidos correctamente' 
        });
        
        // Actualizar la lista después de la operación exitosa
        this.loadCertificates(() => {
          this.filterCertificates(); // Aplicar filtros nuevamente
        });
      },
      error: (error) => {
        console.error('Error al vencer los certificados:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error al vencer los certificados: ' + error.message 
        });
      },
      complete: () => {
        this.isUpdating = false;
      }
    });
  }

  confirmExpireCertificates(): void {
    console.log("Se ejecuta confirmExpireCertificates");
    this.confirmationService.confirm({
      message: '<div style="white-space: pre-line">¿Estás seguro de que deseas vencer TODOS los certificados?<br><br>Esta acción no se puede revertir y los estudiantes con los certificados aprobados tendrán que enviar nuevamente la solicitud</div>',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      accept: () => {
        console.log("Se aceptó la confirmación");
        this.expireCertificates();
      },
      reject: () => {
        console.log("Se rechazó la confirmación");
      }
    });
  }  
}
