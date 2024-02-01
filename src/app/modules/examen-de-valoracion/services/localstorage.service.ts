import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    saveFormState(form: FormGroup, key: string) {
        const formValueWithoutFilesAndDatesAsString =
            this.mapFormValueWithoutFilesAndDatesAsString(form.value);
        if (this.hasValues(formValueWithoutFilesAndDatesAsString)) {
            localStorage.setItem(
                key,
                JSON.stringify(formValueWithoutFilesAndDatesAsString)
            );
        }
    }

    clearLocalStorage(key: string) {
        localStorage.removeItem(key);
    }

    getFormState(key: string): any {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : null;
    }

    private mapFormValueWithoutFilesAndDatesAsString(obj: any): any {
        const newObj: any = {};
        Object.keys(obj).forEach((key) => {
            if (
                !(obj[key] instanceof File) &&
                !(obj[key] instanceof FileList)
            ) {
                if (obj[key] instanceof Date) {
                    newObj[key] = obj[key].toISOString(); // Convertir la fecha a cadena ISO
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    newObj[key] = this.mapFormValueWithoutFilesAndDatesAsString(
                        obj[key]
                    );
                } else {
                    newObj[key] = obj[key];
                }
            }
        });
        return newObj;
    }

    private hasValues(obj: any): boolean {
        return Object.values(obj).some(
            (value) => value !== null && value !== undefined
        );
    }
}
