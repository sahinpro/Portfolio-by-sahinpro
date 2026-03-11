import ChromaGrid from "@/components/ChromaGrid";

export const WhyChooseUsSection = (): JSX.Element => {
  return (
    <section className="flex flex-col container mx-auto items-center gap-12 px-4 py-10 sm:px-8 lg:px-12 lg:py-14 relative">
      <div className="flex flex-col w-full container mx-auto items-center gap-5 relative z-10">
        <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-8">
          <h2 className="w-full section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
            Why Choose Me
          </h2>

          <p className="w-full [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-base sm:text-lg md:text-xl text-center tracking-[-0.20px] leading-6 sm:leading-7 md:leading-[32.0px]">
            Trusted by 100+ clients for delivering quality solutions, on-time
            delivery, and excellent support.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 w-full container mx-auto relative z-10 px-0 lg:px-4 ">
        <ChromaGrid />
      </div>
    </section>
  );
};
