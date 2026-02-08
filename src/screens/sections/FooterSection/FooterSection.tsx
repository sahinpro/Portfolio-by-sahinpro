import { HeroTitle } from "../HeroSection";

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="flex flex-col w-full mx-auto items-center justify-center gap-[62px] pt-14 pb-12 px-4 md:px-[154px] relative bg-transparent border-t border-[#e6e6e61a] bg-[linear-gradient(0deg,rgba(112,112,112,0.01)_0%,rgba(112,112,112,0.01)_100%)] ">
        <div className="flex flex-col container mx-auto  items-center justify-center gap-2">
          <HeroTitle/>
        <p className="flex items-center justify-center mt-[-1.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap">
          © 2026 Sahin Alam. All rights reserved.
        </p>
        </div>
     
    </footer>
  );
};
