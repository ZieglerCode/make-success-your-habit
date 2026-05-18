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
  const videoMatch = block.match(/^\[video]\((.+)\)$/i);
  const headingMatch = block.match(/^##\s+(.+)$/);
  const subheadingMatch = block.match(/^###\s+(.+)$/);
  const quoteMatch = block.match(/^>\s+(.+)$/);
  const calloutMatch = block.match(/^\[callout](.+)$/i);

  if (imageMatch) {
    return (
      <img
        alt={imageMatch[1] || ""}
        className="my-10 aspect-[16/10] w-full rounded-[24px] object-cover"
        src={imageMatch[2]}
      />
    );
  }

  if (videoMatch) {
    return (
      <video
        className="my-10 aspect-video w-full rounded-[24px] object-cover"
        controls
        playsInline
        src={videoMatch[1]}
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
