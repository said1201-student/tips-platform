import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Tip<span className="text-accent">Slip</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm">
              This platform provides betting tips and slip codes for
              informational purposes. We do not accept bets, process betting
              payments, or operate as a bookmaker. Betting activities take place
              on external platforms.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold text-white">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/tips" className="hover:text-accent">
                  Browse Tips
                </Link>
              </li>
              <li>
                <Link href="/tipsters" className="hover:text-accent">
                  Top Tipsters
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-accent">
                  Betting Companies
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-accent">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold text-white">
              Responsible Gambling
            </h4>
            <p className="mt-4 text-sm">
              <span className="chip bg-white/10 text-white">18+</span>{" "}
              <span className="chip bg-white/10 text-white">Gamble Responsibly</span>
            </p>
            <p className="mt-3 text-xs text-white/60">
              Only bet what you can afford to lose. If gambling stops being fun,
              seek support.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} TipSlip. All rights reserved.</p>
          <p>Tips are for information only. Betting is your own responsibility.</p>
        </div>
      </div>
    </footer>
  );
}
