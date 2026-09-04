import Link from "next/link";
import { salir } from "@/app/login/actions";

export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="text-base font-semibold text-slate-900">
            Control de stock
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/api/exportar"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Respaldo
            </a>
            <form action={salir}>
              <button
                type="submit"
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">{children}</main>
    </>
  );
}
