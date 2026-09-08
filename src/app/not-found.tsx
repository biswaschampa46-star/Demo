import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[1400px] flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="label">Error 404</p>
      <h1 className="display-2 text-foam">
        This page drifted
        <br />
        <span className="text-stroke">out of reach.</span>
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-mist">
        The page you were looking for is not here — but the catalogue is only
        one click away.
      </p>
      <Link href="/" className="btn btn-solid">
        Back to Home <ArrowRight className="btn-arrow h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
