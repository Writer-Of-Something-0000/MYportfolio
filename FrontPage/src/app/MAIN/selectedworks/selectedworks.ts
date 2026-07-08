import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SessionTracker } from '../../services/session-tracker';

interface Work {
  title: string;
  youtubeId: string;
  tags: string[];
}

@Component({
  selector: 'app-selectedworks',
  standalone: false,
  templateUrl: './selectedworks.html',
  styleUrl: './selectedworks.css',
})
export class Selectedworks implements OnInit, OnDestroy {
  // youtubeId is the part after "watch?v=" in the YouTube link
  works: Work[] = [
    {
      title: 'Americans 6th visit',
      youtubeId: 'rHFLAPJpMDM',
      tags: ['Premiere pro', 'Drone', 'Camera', 'Audio Design', 'Video storytelling', 'Cinematography'],
    },
    {
      title: 'Car poster album',
      youtubeId: 'ZR6KxR_Xw9c',
      tags: ['Photoshop', 'Car', 'poster', 'Design'],
    },
    {
      title: 'My portfolio Site',
      youtubeId: 'WazNMRIBdnE',
      tags: ['Angular', 'C#', 'WebDevelopment', 'Design'],
    },
  ];

  playingId: string | null = null;
  embedUrl: SafeResourceUrl | null = null;

  // Same read-only key as the projects page; restricted in Google Cloud Console
  private readonly apiKey = 'AIzaSyCI44mJOZSCZhWmXzbjIdZIo2AQyxYXV-c';
  // "UU..." = uploads playlist of the @lukagengashvili channel
  private readonly uploadsPlaylistId = 'UUiymhMkwi-AaW3XxfrhdWHg';

  constructor(private sanitizer: DomSanitizer, private session: SessionTracker) {}

  // ─────────────────────────────────────────────────────────────
  //  Cover-flow: a sleek, shallow 3D carousel. The active card sits
  //  flat & front; neighbours fan back with a slight rotation.
  // ─────────────────────────────────────────────────────────────
  active = 0;

  private get count(): number {
    return Math.max(this.works.length, 1);
  }

  // signed distance from the active card, wrapped so the row feels circular
  private offset(i: number): number {
    const n = this.count;
    let d = i - this.active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  isActive(i: number): boolean {
    return this.offset(i) === 0;
  }

  // per-card 3D placement, recomputed whenever `active` changes
  cardStyle(i: number): { [k: string]: string } {
    const d = this.offset(i);
    const ad = Math.abs(d);
    const spacing = 210; // horizontal gap between neighbours
    const depth = 240; // how far back the neighbours sit
    const angle = 46; // fan rotation, degrees
    const hidden = ad > 1.6; // only show the centre + one card each side
    return {
      transform:
        `translateX(${(d * spacing).toFixed(0)}px) ` +
        `translateZ(${(-ad * depth).toFixed(0)}px) ` +
        `rotateY(${(-d * angle).toFixed(1)}deg) ` +
        `scale(${(1 - ad * 0.05).toFixed(3)})`,
      'z-index': `${100 - Math.round(ad * 10)}`,
      opacity: hidden ? '0' : `${(1 - ad * 0.18).toFixed(2)}`,
      'pointer-events': hidden ? 'none' : 'auto',
    };
  }

  next(): void {
    this.active = (this.active + 1) % this.count;
  }
  prev(): void {
    this.active = (this.active - 1 + this.count) % this.count;
  }
  goTo(i: number): void {
    this.active = i;
  }

  // clicking a side card brings it to the front; clicking the front one plays
  cardClick(i: number, work: Work): void {
    if (this.dragged) return;
    if (!this.isActive(i)) {
      this.goTo(i);
      return;
    }
    this.play(work);
  }

  // ── drag / flick (mouse) + auto-advance ──
  private dragging = false;
  private dragged = false;
  private startX = 0;
  private autoTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadTopVideos();
    this.startAuto();
  }
  ngOnDestroy(): void {
    this.stopAuto();
  }

  private startAuto(): void {
    this.stopAuto();
    this.autoTimer = setInterval(() => {
      if (!this.playingId) this.next();
    }, 4000);
  }
  private stopAuto(): void {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = null;
  }

  onEnter(): void {
    this.stopAuto();
  }
  onLeave(): void {
    this.dragging = false;
    this.startAuto();
  }

  // works for both mouse drag and touch swipe (touch-action: pan-y lets the
  // page still scroll vertically while horizontal swipes flip the cards)
  dragStart(event: PointerEvent): void {
    this.dragging = true;
    this.dragged = false;
    this.startX = event.clientX;
    this.stopAuto();
  }
  dragMove(event: PointerEvent): void {
    if (!this.dragging) return;
    if (Math.abs(event.clientX - this.startX) > 6) this.dragged = true;
  }
  dragEnd(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    const dx = event.clientX - this.startX;
    if (dx > 45) this.prev();
    else if (dx < -45) this.next();
    this.startAuto();
  }
  // vertical scroll interrupts the swipe — reset without flipping
  dragCancel(): void {
    this.dragging = false;
    this.startAuto();
  }

  private async loadTopVideos() {
    try {
      const list = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${this.uploadsPlaylistId}&maxResults=50&key=${this.apiKey}`
      ).then((res) => res.json());

      const ids = (list.items ?? [])
        .map((item: any) => item.snippet?.resourceId?.videoId)
        .filter(Boolean);

      if (!ids.length) return;

      const details = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(',')}&key=${this.apiKey}`
      ).then((res) => res.json());

      const top = (details.items ?? []).filter((item: any) =>
        this.tagsOf(item).some((tag) => tag.toLowerCase() === 'top')
      );

      if (!top.length) return;

      this.works = top.map((item: any) => ({
        title: item.snippet.title,
        youtubeId: item.id,
        tags: this.tagsOf(item)
          .filter((tag) => tag.toLowerCase() !== 'top')
          .slice(0, 7),
      }));
      this.active = 0;
    } catch {
      // network/API failure: the hardcoded fallback stays visible
    }
  }

  private tagsOf(item: any): string[] {
    return item.snippet?.tags?.length
      ? item.snippet.tags
      : this.hashtagsFrom(item.snippet?.description ?? '');
  }

  // "#premierepro #trailer ..." written in the video description also counts as tags
  private hashtagsFrom(description: string): string[] {
    return (description.match(/#[\p{L}\d_]+/gu) ?? []).map((tag) => tag.slice(1));
  }

  thumb(id: string) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  play(work: Work) {
    if (this.dragged) return; // a drag that ended on a card is not a click
    this.session.trackVideo(work.youtubeId, work.title);
    this.playingId = work.youtubeId;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${work.youtubeId}?autoplay=1&rel=0`
    );
    this.stopAuto();
  }
}
