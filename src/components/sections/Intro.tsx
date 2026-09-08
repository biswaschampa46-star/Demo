import Reveal from "@/components/Reveal";

export default function Intro() {
  return (
    <section className="relative py-24 md:py-40" aria-label="Philosophy">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">Our Philosophy</p>
        </Reveal>

        <Reveal delay={90}>
          <h2 className="display-2 mt-8 max-w-5xl text-foam">
            <span className="lm lm-io"><span>Designed for</span></span>
            <span className="lm lm-io"><span className="text-stroke">the way you live.</span></span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-12">
          <Reveal delay={160} className="md:col-span-5 md:col-start-8">
            <div className="hairline mb-8 w-24" aria-hidden="true" />
            <p className="body-lead">
              We keep the catalogue small on purpose. Every object here was
              chosen slowly — for how it feels in the hand, how it ages on a
              shelf, and how quietly it fits into your day.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-mist/70">
              No noise. No clutter. Just things worth keeping.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
