import { Injectable, inject } from '@angular/core';

export type PlatformType = 'windows' | 'mac' | 'linux' | 'unknown';

export function detectPlatform(userAgentInput?: string): PlatformType {
  const userAgent = (userAgentInput ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();

  if (/windows nt|win32|win64|wow64/.test(userAgent)) {
    return 'windows';
  }
  if (/macintosh|mac os x|mac os|darwin/.test(userAgent)) {
    return 'mac';
  }
  if (/linux|x11/.test(userAgent)) {
    return 'linux';
  }
  return 'unknown';
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  get current(): PlatformType {
    return detectPlatform();
  }

  getPrimaryCtaLabel(): string {
    switch (this.current) {
      case 'windows':
        return 'Download for Windows';
      case 'mac':
        return 'Download for macOS';
      case 'linux':
        return 'Download for Linux';
      default:
        return 'View Downloads';
    }
  }
}
