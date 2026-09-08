import Reveal from "@/components/Reveal";

const ITEMS = [
  {
    n: "01",
    title: "Quality",
    text: "Carefully selected products, chosen to last beyond a season.",
  },
  {
    n: "02",
    title: "Secure",
    text: "Safe and reliable advance payment via bKash, Nagad or Rocket.",
  },
  {
    n: "03",
    title: "Fast",
    text: "Quick, careful delivery across Bangladesh.",
  },
  {
    n: "04",
    title: "Support",
    text: "We are here when you need us — before and after your order.",
  },
];

export default function WhyUs() {
  return (
    <section className="relative py-24 md:py-36" aria-label="Why choose us">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">Why EVERE</p>
        </Reveal>

        <div className="mt-14 grid gap-12 border-t border-line-soft pt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {ITEMS.map((item, i) => (
            <Reveal key={item.n} delay={i * 100}>
              <div>
                <p className="font-display text-sm font-medium tracking-[0.3em] text-soft/80">
                  {item.n}
                </p>
                <div className="my-6 h-px w-9 bg-accent/70" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-foam">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
