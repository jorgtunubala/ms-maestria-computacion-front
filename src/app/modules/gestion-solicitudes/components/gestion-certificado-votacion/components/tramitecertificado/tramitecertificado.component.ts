import { Component, OnInit } from '@angular/core';
import { CertificadoVotacionService, CertificadoVotacion, AcademicPeriod } from '../../services/certificado-votacion.service';
import { MessageService } from 'primeng/api';
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

  constructor(
    private certificadoService: CertificadoVotacionService,
    private messageService: MessageService
  ) {}

  hasApprovedCertificates(): boolean {
    return this.certificates.some(cert => cert.estado === 'Aprobada');
  }

  ngOnInit(): void {
    this.loadCertificates(() => {
      this.loadAcademicPeriods();
    });
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

  loadAcademicPeriods(): void {
    this.certificadoService.obtenerPeriodosAcademicos().subscribe({
      next: (response: any[]) => {
        this.originalPeriodData = response;
  
        // Obtener y ordenar períodos de forma descendente
        const uniquePeriods = [...new Set(response.map(item => item.fecha_ingreso))]
          .sort((a, b) => b.localeCompare(a));
  
        this.academicPeriods = uniquePeriods.map(periodo => ({
          label: periodo,
          value: periodo
        }));
  
        // Esperar un ciclo de detección de cambios antes de asignar el período
        if (this.academicPeriods.length > 0) {
          setTimeout(() => {
            this.selectedPeriod = { ...this.academicPeriods[0] }; // Copia segura del objeto
            this.latestPeriodLabel = `${this.selectedPeriod.label}`;
  
            // Dispara manualmente el evento de selección para actualizar la vista
            this.filterByPeriod();
          }, 0);
        } else {
          console.warn("⚠️ No hay períodos académicos disponibles.");
        }
      },
      error: (error) => {
        console.error('Error al cargar períodos académicos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los períodos académicos'
        });
      }
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
  
    if (!approvedCerts.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `No hay certificados aprobados para el período ${this.selectedPeriod.value}`,
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
      period: period,
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
}
