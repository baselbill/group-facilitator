import { getStudy } from "@/lib/content";
import LordsDayPicker from "@/components/LordsDayPicker";
import InstallBanner from "@/components/InstallBanner";

export default function HomePage() {
  const { study, error } = getStudy();

  if (error || !study) {
    return (
      <main className="error-screen">
        <p className="error-message">
          Content unavailable — check your connection or reload.
        </p>
      </main>
    );
  }

  return (
    <main className="page-root">
      <InstallBanner />
      <LordsDayPicker study={study} />
    </main>
  );
}
