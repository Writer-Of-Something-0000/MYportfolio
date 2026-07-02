import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
export class Selectedworks implements OnInit {
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

  constructor(private sanitizer: DomSanitizer) {}

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
    this.playingId = work.youtubeId;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${work.youtubeId}?autoplay=1&rel=0`
    );
  }

  // --- drag-to-scroll slider ---
  @ViewChild('slider') slider!: ElementRef<HTMLDivElement>;

  private isDown = false;
  private startX = 0;
  private scrollStart = 0;
  private dragged = false;

  dragStart(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return; // on touch the browser scrolls natively
    this.isDown = true;
    this.dragged = false;
    this.startX = event.clientX;
    this.scrollStart = this.slider.nativeElement.scrollLeft;
  }

  dragMove(event: PointerEvent) {
    if (!this.isDown) return;
    const dx = event.clientX - this.startX;
    if (Math.abs(dx) > 5) this.dragged = true;
    this.slider.nativeElement.scrollLeft = this.scrollStart - dx;
  }

  dragEnd() {
    this.isDown = false;
  }
}
