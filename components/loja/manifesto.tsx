/** Texto grande em que cada palavra se acende conforme a rolagem. Sem a animação, o texto aparece normalmente. */
export function Manifesto({ rotulo, texto }: { rotulo: string; texto: string }) {
  const palavras = texto.split(" ");
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-24 sm:px-6 sm:py-32">
      <p className="rotulo text-muted-foreground">{rotulo}</p>
      <p className="font-display text-4xl font-light leading-[1.15] tracking-tight text-balance sm:text-6xl">
        {palavras.map((p, i) => (
          <span key={i} className="palavra-acende" style={{ ["--i" as string]: i }}>
            {p}{i < palavras.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
