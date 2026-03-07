import MapMockup from "@/components/MapMockup";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-950 sm:p-4">
      {/* 
        This wrapper forces a mobile-first, iPhone 17 Pro Max layout.
        On mobile (default), it explicitly uses h-[100dvh].
        On larger screens (sm:), it acts like a phone chassis. (430x932 is the Pro Max resolution approx)
      */}
      <div className="relative w-full h-[100dvh] sm:min-h-0 sm:w-[430px] sm:h-[932px] sm:max-h-[95vh] sm:rounded-[3rem] sm:border-[12px] border-gray-900 overflow-hidden shadow-2xl bg-black transition-all">
        {/* Decorative Dynamic Island for Desktop Mockup */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50 pointer-events-none"></div>
        <MapMockup />
      </div>
    </main>
  );
}
