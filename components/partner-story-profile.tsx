type PartnerStoryProfileProps = {
  name: string;
  imageSrc?: string;
  imageAlt?: string;
};

export function PartnerStoryProfile({
  name,
  imageSrc,
  imageAlt,
}: PartnerStoryProfileProps) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      {imageSrc && imageAlt ? (
        <img
          alt={imageAlt}
          className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
          decoding="async"
          height={480}
          loading="lazy"
          src={imageSrc}
          width={480}
        />
      ) : null}
      <h3 className="min-w-0 break-words font-serif text-2xl text-brand-primary md:text-3xl">
        {name}
      </h3>
    </div>
  );
}
