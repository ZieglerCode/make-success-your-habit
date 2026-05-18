export default function BlogLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#f9f4e7] px-6 pb-16 pt-28 text-[#03182e] md:pb-24 md:pt-36">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-[#b49474]/30 pb-14 md:grid-cols-[0.9fr_1.1fr]">
          <div className="h-4 w-36 rounded-full bg-[#b49474]/20" />
          <div>
            <div className="h-3 w-28 rounded-full bg-[#b49474]/20" />
            <div className="mt-6 h-16 max-w-2xl rounded-3xl bg-[#b49474]/16" />
            <div className="mt-8 h-4 max-w-xl rounded-full bg-[#b49474]/14" />
            <div className="mt-3 h-4 max-w-lg rounded-full bg-[#b49474]/14" />
          </div>
        </div>
        <div className="grid gap-8 pt-14 md:grid-cols-2">
          {Array.from({length: 3}).map((_, index) => (
            <div className={index === 0 ? "md:col-span-2 md:grid md:grid-cols-[1fr_1.1fr] md:gap-10" : ""} key={index}>
              <div className="aspect-[16/10] rounded-[28px] bg-[#b49474]/16" />
              <div className="pt-6">
                <div className="h-3 w-40 rounded-full bg-[#b49474]/18" />
                <div className="mt-5 h-10 max-w-lg rounded-2xl bg-[#b49474]/16" />
                <div className="mt-5 h-4 max-w-xl rounded-full bg-[#b49474]/14" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
