import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SessionTracker } from '../../services/session-tracker';

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  publishedAt: number; // ms timestamp, used for date sorting
  orientation: '169' | '916'; // from the #169 / #916 hashtag on YouTube
  durationSec: number; // video length, used for the long/shorts filter
}

type SortOrder = 'newest' | 'oldest';
type Orientation = '169' | '916';
type Length = 'long' | 'short';
// 'all' = Video Storytelling (everything); 'graphicdesign' = only #graphicdesign videos
type Category = 'all' | 'graphicdesign';

// YouTube counts anything up to 3 minutes as a Short
const SHORT_MAX_SECONDS = 180;

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

  // filter/sort state driven by the controls above the grid
  sortOrder: SortOrder = 'newest';
  orientation: Orientation = '169';
  length: Length | null = null; // null = show both long videos and shorts
  category: Category = 'all'; // 'all' = Video Storytelling; 'graphicdesign' = filtered

  constructor(
    private sanitizer: DomSanitizer,
    private session: SessionTracker,
    private route: ActivatedRoute
  ) {}

  // videos shown in the grid: filtered by category + orientation + length, then sorted by date
  get visibleVideos(): ChannelVideo[] {
    return this.videos
      .filter((v) => v.orientation === this.orientation)
      .filter(
        (v) =>
          this.category === 'all' ||
          v.tags.some((t) => t.replace(/\s+/g, '').toLowerCase() === this.category)
      )
      .filter((v) => {
        if (!this.length) return true; // no length filter → show both
        return this.length === 'short'
          ? v.durationSec <= SHORT_MAX_SECONDS
          : v.durationSec > SHORT_MAX_SECONDS;
      })
      .sort((a, b) =>
        this.sortOrder === 'newest'
          ? b.publishedAt - a.publishedAt
          : a.publishedAt - b.publishedAt
      );
  }

  setSort(order: SortOrder) {
    this.sortOrder = order;
  }

  setCategory(category: Category) {
    if (this.category === category) return;
    this.category = category;
    this.stopPlayback();
  }

  setOrientation(orientation: Orientation) {
    if (this.orientation === orientation) return;
    this.orientation = orientation;
    this.stopPlayback();
  }

  setLength(length: Length | null) {
    if (this.length === length) return;
    this.length = length; // null = "All": both long videos and shorts
    this.stopPlayback();
  }

  // a video that's now filtered out shouldn't keep playing off-screen
  private stopPlayback() {
    this.playingId = null;
    this.embedUrl = null;
  }

  ngOnInit(): void {
    // deep links from the hero pills, e.g. /projects?category=graphicdesign,
    // /projects?ratio=916, /projects?length=short
    const q = this.route.snapshot.queryParamMap;
    if (q.get('category') === 'graphicdesign') this.category = 'graphicdesign';
    const ratio = q.get('ratio');
    if (ratio === '169' || ratio === '916') this.orientation = ratio;
    const length = q.get('length');
    if (length === 'long' || length === 'short') this.length = length;
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

      // second call brings the video tags + duration, which playlistItems doesn't include
      const details = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids.join(',')}&key=${this.apiKey}`
      ).then((res) => res.json());

      this.videos = (details.items ?? []).map((item: any) => {
        const allTags: string[] = item.snippet.tags?.length
          ? item.snippet.tags
          : this.hashtagsFrom(item.snippet.description ?? '');

        // #916 marks a vertical (9:16) video; everything else is 16:9
        const orientation: Orientation = allTags.some((t) => t === '916')
          ? '916'
          : '169';

        return {
          id: item.id,
          title: item.snippet.title,
          thumbnail:
            item.snippet.thumbnails?.high?.url ??
            `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          publishedAt: Date.parse(item.snippet.publishedAt ?? '') || 0,
          durationSec: this.parseDuration(item.contentDetails?.duration ?? ''),
          orientation,
          // the orientation hashtags are metadata, not tags worth showing
          tags: allTags.filter((t) => t !== '169' && t !== '916').slice(0, 7),
        };
      });
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

  // ISO 8601 ("PT1M30S", "PT45S", "PT1H2M") → total seconds
  private parseDuration(iso: string): number {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    const [, h, min, s] = m;
    return (+h || 0) * 3600 + (+min || 0) * 60 + (+s || 0);
  }

  play(video: ChannelVideo) {
    this.session.trackVideo(video.id, video.title);
    this.playingId = video.id;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`
    );
  }
}
