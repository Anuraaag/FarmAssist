import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DiagnosisComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
  showInstallButton = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        });
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: BeforeInstallPromptEvent): void {
    event.preventDefault();
    this.deferredInstallPrompt = event;
    this.showInstallButton = true;
  }

  @HostListener('window:appinstalled')
  onAppInstalled(): void {
    this.showInstallButton = false;
    this.deferredInstallPrompt = null;
  }

  async installApp(): Promise<void> {
    if (!this.deferredInstallPrompt) return;
    this.deferredInstallPrompt.prompt();
    const { outcome } = await this.deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      this.showInstallButton = false;
    }
    this.deferredInstallPrompt = null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
