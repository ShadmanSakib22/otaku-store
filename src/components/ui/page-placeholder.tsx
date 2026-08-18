export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm text-neutral-500">{description}</p>
      ) : null}
    </main>
  );
}