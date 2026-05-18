export default function AdminLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#f8f1e4] px-5 py-8 text-[#03182e] md:px-8 md:py-10 lg:pl-80">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-[#b49474]/20 pb-8">
          <div className="h-3 w-32 rounded-full bg-[#b49474]/20" />
          <div className="mt-5 h-12 max-w-xl rounded-2xl bg-[#b49474]/16" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({length: 6}).map((_, index) => (
            <div className="rounded-[24px] border border-[#b49474]/16 bg-[#fcf3e3]/60 p-5" key={index}>
              <div className="h-4 w-24 rounded-full bg-[#b49474]/18" />
              <div className="mt-5 h-8 w-20 rounded-xl bg-[#b49474]/20" />
              <div className="mt-4 h-3 w-full rounded-full bg-[#b49474]/14" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-[#b49474]/14" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
