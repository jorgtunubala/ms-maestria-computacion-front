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
    this.loadCertificates();
    this.loadAcademicPeriods();
  }

  loadCertificates(): void {
    this.loading = true;
    this.certificadoService.obtenerCertificado().subscribe({
      next: (response) => {
        this.certificates = response || [];
        this.filteredCertificates = this.certificates;
        this.loading = false;
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
        this.originalPeriodData = response; // Guardamos la respuesta completa
        const uniquePeriods = [...new Set(response.map(item => item.fecha_ingreso))].sort();
        this.academicPeriods = uniquePeriods.map(periodo => ({
          label: periodo,
          value: periodo
        }));
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
    // Usamos filteredCertificates para respetar los filtros actuales
    const approvedCerts = this.filteredCertificates.filter(
      (cert) => cert.estado === 'Aprobada'
    );

    if (!approvedCerts.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: this.selectedPeriod 
          ? `No hay certificados aprobados para el período ${this.selectedPeriod.value}`
          : 'No hay certificados aprobados para descargar',
      });
      return;
    }

    this.downloading = true;
    this.loading = true;

    // Obtenemos los IDs de los certificados aprobados para enviarlos al backend
    const approvedIds = approvedCerts.map(cert => cert.id_Certificado);

    this.certificadoService.downloadCertificado({
      period: this.selectedPeriod?.value || null,
      certificateIds: approvedIds,
    }).subscribe({
      next: (blob: Blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        const periodText = this.selectedPeriod ? `_${this.selectedPeriod.value}` : '';
        const fileName = `certificados_aprobados${periodText}_${fecha}.zip`;
        saveAs(blob, fileName);

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
          detail: 'Error al descargar los certificados',
        });
      },
      complete: () => {
        this.loading = false;
        this.downloading = false;
      },
    });
  }
}
