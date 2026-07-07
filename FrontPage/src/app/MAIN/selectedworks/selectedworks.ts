import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class Selectedworks implements OnInit, AfterViewInit, OnDestroy {
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

  constructor(
    private sanitizer: DomSanitizer,
    private session: SessionTracker,
    private zone: NgZone,
  ) {}

  // ─────────────────────────────────────────────────────────────
  //  3D circular carousel
  // ─────────────────────────────────────────────────────────────
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;

  // one carousel card's footprint (px)
  readonly cardW = 300;

  get count(): number {
    return Math.max(this.works.length, 1);
  }
  // angle between neighbouring cards around the ring
  get step(): number {
    return 360 / this.count;
  }
  // ring radius: big enough that cards never overlap, capped so it fits the column
  get radius(): number {
    if (this.count <= 1) return 0;
    const geometric = this.cardW / 2 / Math.tan(Math.PI / this.count);
    return Math.round(Math.min(Math.max(this.cardW * 0.8, geometric), 300));
  }
  // static per-card placement on the ring (evaluated once by the template)
  cardTransform(i: number): string {
    return `rotateY(${i * this.step}deg) translateZ(${this.radius}px)`;
  }

  // motion state (driven outside Angular in a rAF loop)
  private rotation = 0;
  private velocity = 0;
  private readonly auto = 0.12; // idle spin speed, deg per frame
  private dragging = false;
  private hovered = false;
  private startX = 0;
  private startRot = 0;
  private lastX = 0;
  private dragged = false;
  private rafId = 0;

  // where velocity eases back to when the user isn't touching it
  private get targetVelocity(): number {
    if (this.playingId || this.hovered) return 0; // freeze while watching / hovering
    return this.auto;
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.loop());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);
    if (!this.dragging) {
      this.velocity += (this.targetVelocity - this.velocity) * 0.06; // gentle ease
    }
    this.rotation += this.velocity;
    if (this.stage) {
      this.stage.nativeElement.style.transform =
        `translateZ(${-this.radius}px) rotateY(${this.rotation}deg)`;
    }
  };

  // grab & spin (mouse only; touch keeps native page scroll + tap-to-play)
  dragStart(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.dragging = true;
    this.dragged = false;
    this.startX = event.clientX;
    this.lastX = event.clientX;
    this.startRot = this.rotation;
    this.velocity = 0;
  }

  dragMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const dx = event.clientX - this.startX;
    if (Math.abs(dx) > 4) this.dragged = true;
    this.rotation = this.startRot + dx * 0.35;
    this.velocity = (event.clientX - this.lastX) * 0.35; // carries as fling momentum
    this.lastX = event.clientX;
  }

  dragEnd(): void {
    this.dragging = false;
  }

  onEnter(): void {
    this.hovered = true;
  }
  onLeave(): void {
    this.hovered = false;
    this.dragging = false;
  }

  // arrow buttons nudge the ring one step and let it settle back to idle spin
  prev(): void {
    this.velocity = this.step * 0.14;
  }
  next(): void {
    this.velocity = -this.step * 0.14;
  }

  // Channel videos marked with #top replace the hardcoded fallback list
  ngOnInit(): void {
    this.loadTopVideos();
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
  }
}
