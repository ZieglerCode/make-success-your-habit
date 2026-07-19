type BlogContentRendererProps = {
  content: string;
  className?: string;
};

export function BlogContentRenderer({content, className = "prose-brand"}: BlogContentRendererProps) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (!blocks.length) {
    return (
      <div className={className}>
        <p>Der Beitrag hat noch keinen Inhalt.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <ContentBlock block={block} key={`${block}-${index}`} />
      ))}
    </div>
  );
}

function ContentBlock({block}: {block: string}) {
  const imageMatch = block.match(/^!\[(.*)]\((.+)\)$/);
  const mediaMatch = block.match(/^\[(?:video|media)]\((.+)\)$/i);
  const headingMatch = block.match(/^##\s+(.+)$/);
  const subheadingMatch = block.match(/^###\s+(.+)$/);
  const quoteMatch = block.match(/^>\s+(.+)$/);
  const calloutMatch = block.match(/^\[callout](.+)$/i);

  if (imageMatch) {
    return (
      <img
        alt={imageMatch[1] || ""}
        className="my-10 aspect-[16/10] w-full rounded-[24px] object-cover shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        src={imageMatch[2]}
      />
    );
  }

  if (mediaMatch) {
    const url = mediaMatch[1].trim();
    const youtubeId = getYouTubeId(url);
    const vimeoId = getVimeoId(url);
    const spotifyEmbedUrl = getSpotifyEmbedUrl(url);
    const isSoundCloud = url.includes("soundcloud.com");
    const isAudio = /\.(mp3|wav|m4a|ogg)(\?|#|$)/i.test(url);

    if (youtubeId) {
      return (
        <div className="my-10 overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <iframe
            className="aspect-video w-full border-0"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    if (vimeoId) {
      return (
        <div className="my-10 overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <iframe
            className="aspect-video w-full border-0"
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title="Vimeo video player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (spotifyEmbedUrl) {
      return (
        <div className="my-10 overflow-hidden rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <iframe
            className="w-full border-0"
            src={spotifyEmbedUrl}
            height="352"
            title="Spotify player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      );
    }

    if (isSoundCloud) {
      const soundCloudEmbedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23b49474&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
      return (
        <div className="my-10 overflow-hidden rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <iframe
            className="w-full border-0"
            src={soundCloudEmbedUrl}
            height="166"
            title="SoundCloud player"
            loading="lazy"
          />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="my-10 flex items-center justify-center rounded-[24px] border border-[#b49474]/20 bg-[#fffaf0] p-6 shadow-sm">
          <audio className="w-full" controls src={url} />
        </div>
      );
    }

    // Fallback to native video element
    return (
      <video
        className="my-10 aspect-video w-full rounded-[24px] object-cover shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
        controls
        playsInline
        src={url}
      />
    );
  }

  if (subheadingMatch) {
    return <h3 className="mt-10 text-2xl font-semibold leading-tight tracking-tight text-[#03182e]">{subheadingMatch[1]}</h3>;
  }

  if (headingMatch) {
    return <h2 className="mt-12 text-3xl font-semibold leading-tight tracking-tight text-[#03182e]">{headingMatch[1]}</h2>;
  }

  if (calloutMatch) {
    return (
      <div className="my-10 rounded-[24px] border border-[#b49474]/24 bg-[#fcf3e3]/70 px-5 py-5 text-lg leading-8 text-[#4c4235]">
        {calloutMatch[1].trim()}
      </div>
    );
  }

  if (block === "---") {
    return <hr className="my-12 border-[#b49474]/24" />;
  }

  if (quoteMatch) {
    return (
      <blockquote className="my-10 border-l-2 border-[#b49474] pl-5 text-2xl leading-10 text-[#4c4235]">
        {quoteMatch[1]}
      </blockquote>
    );
  }

  if (block.split("\n").every((line) => /^-\s+/.test(line.trim()))) {
    return (
      <ul className="my-8 list-disc space-y-3 pl-6">
        {block.split("\n").map((line) => (
          <li key={line}>{line.replace(/^-\s+/, "")}</li>
        ))}
      </ul>
    );
  }

  return <p>{block}</p>;
}

// Media URL Helpers
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Vimeo URL Helper
function getVimeoId(url: string): string | null {
  const regExp = /^.*(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/[^\/]+\/video\/|showcase\/[^\/]+\/video\/)?([0-9]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Spotify URL Helper
function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/https?:\/\/(?:open|play)\.spotify\.com\/(track|playlist|album|artist|show|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  return null;
}
