import { Separator } from "../../../components/ui/separator";

const footerLinks = {
  product: {
    title: "Services",
    links: ["Web Design", "Full Stack Development", "WordPress Development", "E-commerce Solutions", "SEO Optimization"],
  },
  company: {
    title: "About",
    links: ["My Story", "Experience", "Skills", "Contact Me"],
  },
  resources: {
    title: "Resources",
    links: ["Portfolio Projects", "Blog Posts", "Case Studies"],
  },
  legal: {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service"],
  },
};

const bottomLinks = [
  { text: "Privacy Policy" },
  { text: "Terms of Conditions" },
];

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="flex flex-col w-full max-w-[1440px] mx-auto items-center justify-center gap-[62px] pt-px pb-12 px-4 md:px-[154px] relative bg-transparent border-t border-[#e6e6e61a] bg-[linear-gradient(0deg,rgba(112,112,112,0.01)_0%,rgba(112,112,112,0.01)_100%)]">
      <div className="absolute top-[-18px] left-[calc(50.00%_-_453px)] w-[906px] h-[164px] rounded-[453px/82px] blur-[200px] bg-[linear-gradient(180deg,rgba(199,199,199,1)_0%,rgba(148,148,148,0)_100%)] opacity-40" />

      <div className="absolute top-[-18px] left-[calc(50.00%_-_453px)] w-[906px] h-[164px] rounded-[453px/82px] blur-[200px] bg-[linear-gradient(180deg,rgba(199,199,199,1)_0%,rgba(148,148,148,0)_100%)] opacity-40" />

      <div className="flex flex-col items-start gap-2.5 px-0 py-20 self-stretch w-full relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-0 relative self-stretch w-full">
          <div className="flex flex-col items-start gap-[164px]">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2.5">
                <img
                  className="w-[38.4px] h-[42.4px] mt-[-0.60px] mb-[-7.80px] ml-[-3.20px]"
                  alt="Logo"
                  src="/logo-1.svg"
                />
                <div className="flex items-center justify-center mt-[-1.00px] [font-family:'Aeonik_Pro-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-[34.0px] whitespace-nowrap">
                  Sahin Alam
                </div>
              </div>
              <p className="opacity-50 [font-family:'Aeonik_Pro-Medium',Helvetica] text-white text-[13.9px] tracking-[0.28px] leading-[21.0px] font-medium whitespace-nowrap">
                Full Stack Web Developer & Designer
              </p>
            </div>
            <img
              className="flex-shrink-0"
              alt="Socials icons"
              src="/socials-icons.svg"
            />
          </div>

          <nav className="flex flex-wrap lg:flex-nowrap w-full lg:w-[616px] items-start gap-8 lg:gap-0">
            <div className="flex flex-col items-start gap-[22px] flex-1">
              <h3 className="flex items-center justify-center h-5 mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#f7f7f7] text-sm tracking-[0] leading-5 whitespace-nowrap">
                {footerLinks.product.title}
              </h3>
              <ul className="flex flex-col items-start gap-[23px] w-full">
                {footerLinks.product.links.map((link, index) => (
                  <li key={`product-${index}`}>
                    <a
                      href="#"
                      className={`flex items-center justify-center h-[17px] ${
                        index === 0 ? "mt-[-1.00px]" : ""
                      } [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-white transition-colors`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-[22px] flex-1">
              <h3 className="flex items-center justify-center h-5 mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#ebebeb] text-sm tracking-[0] leading-5 whitespace-nowrap">
                {footerLinks.company.title}
              </h3>
              <ul className="flex flex-col items-start gap-[23px] w-full">
                {footerLinks.company.links.map((link, index) => (
                  <li key={`company-${index}`}>
                    <a
                      href="#"
                      className={`flex items-center justify-center h-[17px] ${
                        index === 0 ? "mt-[-1.00px]" : ""
                      } [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-white transition-colors`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-[22px] flex-1">
              <h3 className="flex items-center justify-center h-5 mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#ebebeb] text-sm tracking-[0] leading-5 whitespace-nowrap">
                {footerLinks.resources.title}
              </h3>
              <ul className="flex flex-col items-start gap-[23px] w-full">
                {footerLinks.resources.links.map((link, index) => (
                  <li key={`resources-${index}`}>
                    <a
                      href="#"
                      className={`flex items-center justify-center h-[17px] ${
                        index === 0 ? "mt-[-1.00px]" : ""
                      } [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-white transition-colors`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-[22px] flex-1">
              <h3 className="flex items-center justify-center h-[21px] mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#ebebeb] text-sm tracking-[0] leading-5 whitespace-nowrap">
                {footerLinks.legal.title}
              </h3>
              <ul className="flex flex-col items-start gap-5 w-full">
                {footerLinks.legal.links.map((link, index) => (
                  <li key={`legal-${index}`}>
                    <a
                      href="#"
                      className={`flex items-center justify-center h-[17px] ${
                        index === 0 ? "mt-[-1.00px]" : ""
                      } [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-white transition-colors`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <Separator className="mt-2.5 bg-[#e6e6e61a]" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 relative self-stretch w-full">
        <div className="flex items-center gap-4">
          {bottomLinks.map((link, index) => (
            <div key={`bottom-${index}`} className="flex items-center gap-4">
              <a
                href="#"
                className="flex items-center justify-center h-[17px] mt-[-1.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-white transition-colors"
              >
                {link.text}
              </a>
              {index < bottomLinks.length - 1 && (
                <span className="flex items-center justify-center h-[17px] mt-[-1.00px] [font-family:'Geist',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5">
                  ·
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="flex items-center justify-center mt-[-1.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap">
          © 2025 Sahin Alam. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
