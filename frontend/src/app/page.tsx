import MapMockup from "@/components/MapMockup";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-950 sm:p-4">
      {/* 
        Mobile-first: fills the entire viewport edge-to-edge on phones.
        Desktop (sm+): constrains to an iPhone Pro Max chassis mockup.
      */}
      <div className="
        relative w-full h-[100dvh] overflow-hidden bg-black transition-all
        sm:min-h-0 sm:w-[430px] sm:h-[932px] sm:max-h-[95vh] sm:rounded-[40px] sm:border-[12px] sm:border-gray-900 sm:shadow-2xl
      ">
        {/* Decorative Dynamic Island for Desktop Mockup Only */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50 pointer-events-none"></div>
        <MapMockup />
      </div>
    </main>
  );
}
