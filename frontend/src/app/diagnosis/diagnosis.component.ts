import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DiagnosisResult {
  disease_name: string;
  scientific_name: string;
  confidence: 'High' | 'Medium' | 'Low';
  severity: 'None' | 'Early' | 'Moderate' | 'Severe';
  affected_crops: string[];
  organic_treatment: string;
  chemical_treatment: string;
  isolate_plant: boolean;
  additional_notes: string;
}

@Component({
  selector: 'app-diagnosis',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
})
export class DiagnosisComponent {
  @Output() resetApp = new EventEmitter<void>();

  result: DiagnosisResult | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const fakeEvent = { target: { files: event.dataTransfer!.files } } as unknown as Event;
      this.onFileSelected(fakeEvent);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private resizeImage(file: File, maxPx = 800): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.82);
      };
      img.src = url;
    });
  }

  async diagnose(): Promise<void> {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.result = null;

    const resized = await this.resizeImage(this.selectedFile);
    const formData = new FormData();
    formData.append('image', resized, 'leaf.jpg');

    this.http
      .post<DiagnosisResult>(`${environment.apiUrl}/api/diagnose`, formData)
      .subscribe({
        next: (data) => {
          this.result = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage =
            err.error?.error || err.message || 'An unexpected error occurred. Please try again.';
          this.isLoading = false;
        },
      });
  }

  reset(): void {
    this.result = null;
    this.errorMessage = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.isLoading = false;
  }

  get confidenceBadgeClass(): string {
    const map: Record<string, string> = {
      High: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-red-100 text-red-800',
    };
    return map[this.result?.confidence ?? ''] ?? 'bg-gray-100 text-gray-800';
  }

  get severityBadgeClass(): string {
    const map: Record<string, string> = {
      None: 'bg-green-100 text-green-800',
      Early: 'bg-yellow-100 text-yellow-800',
      Moderate: 'bg-orange-100 text-orange-800',
      Severe: 'bg-red-100 text-red-800',
    };
    return map[this.result?.severity ?? ''] ?? 'bg-gray-100 text-gray-800';
  }

  get isHealthy(): boolean {
    return this.result?.disease_name?.toLowerCase() === 'healthy';
  }
}
