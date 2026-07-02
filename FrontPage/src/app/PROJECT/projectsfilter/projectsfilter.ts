import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
}

@Component({
  selector: 'app-projectsfilter',
  standalone: false,
  templateUrl: './projectsfilter.html',
  styleUrl: './projectsfilter.css',
})
export class Projectsfilter implements OnInit {
  // Read-only public key; restrict it in Google Cloud Console to this site + YouTube Data API v3
  private readonly apiKey = 'AIzaSyCI44mJOZSCZhWmXzbjIdZIo2AQyxYXV-c';
  // "UU..." = uploads playlist of the @lukagengashvili channel (UC... with UU prefix)
  private readonly uploadsPlaylistId = 'UUiymhMkwi-AaW3XxfrhdWHg';

  videos: ChannelVideo[] = [];
  loading = true;
  playingId: string | null = null;
  embedUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadChannelVideos();
  }

  private async loadChannelVideos() {
    try {
      const list = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${this.uploadsPlaylistId}&maxResults=50&key=${this.apiKey}`
      ).then((res) => res.json());

      const ids = (list.items ?? [])
        .map((item: any) => item.snippet?.resourceId?.videoId)
        .filter(Boolean);

      if (!ids.length) return;

      // second call brings the video tags, which playlistItems doesn't include
      const details = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(',')}&key=${this.apiKey}`
      ).then((res) => res.json());

      this.videos = (details.items ?? []).map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails?.high?.url ??
          `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
        tags: (item.snippet.tags?.length
          ? item.snippet.tags
          : this.hashtagsFrom(item.snippet.description ?? '')
        ).slice(0, 7),
      }));
    } catch {
      // network/API failure: the empty state stays visible
    } finally {
      this.loading = false;
    }
  }

  // "#premierepro #trailer ..." written in the video description also counts as tags
  private hashtagsFrom(description: string): string[] {
    return (description.match(/#[\p{L}\d_]+/gu) ?? []).map((tag) => tag.slice(1));
  }

  play(video: ChannelVideo) {
    this.playingId = video.id;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`
    );
  }
}
