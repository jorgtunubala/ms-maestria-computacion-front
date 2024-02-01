import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Injectable({
    providedIn: 'root',
})
export class PdfService {
    generatePDF(
        htmlContent: HTMLElement,
        filename: string,
        scssStyle: string = `
            .p-card {
                box-shadow: 0 0 0 0 !important;
                border: none !important;
                font-size: 1.2rem;
            }

            .p-card .p-card-content {
                padding: 1.25rem 0;
            }

            .p-disabled, .p-component:disabled {
                opacity: 1;
            }

            .pdf-text {
                font-size: 1.4rem;
            }

            .p-show {
                display: block !important;
            }

            .pdf-label {
                font-size: 1.3rem;
                font-weight: bold;
            }

            .p-inputtext {
                border: none !important;
            }

            .p-fileupload-choose {
                display: none !important;
            }

            .p-hide {
                display: none !important;
            }
        `
    ) {
        const style = document.createElement('style');
        const options = {
            margin: 10,
            filename: filename,
            image: { type: 'png', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'legal', orientation: 'portrait' },
        };
        style.innerHTML = scssStyle;
        htmlContent.appendChild(style);

        html2pdf(htmlContent, options).then(() => {
            htmlContent.removeChild(style);
        });
    }
}
