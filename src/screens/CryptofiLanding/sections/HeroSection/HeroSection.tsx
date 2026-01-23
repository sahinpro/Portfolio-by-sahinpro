import {
  ArrowDownUpIcon,
  ArrowUpRightIcon,
  BellIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";

const skillStats = [
  { icon: "/icons-8.svg", name: "Experience", value: "2+ Years" },
  { icon: "/icons.svg", name: "Projects", value: "200+" },
  { icon: "/icons-2.svg", name: "Satisfaction", value: "100%" },
  { icon: "/icons-7.svg", name: "Languages", value: "6+" },
  { icon: "/icons-6.svg", name: "Technologies", value: "15+" },
  { icon: "/icons-3.svg", name: "Team Size", value: "5 Devs" },
];

const sidebarMenuItems = [
  { icon: "/category.svg", label: "Portfolio", active: true },
  { icon: "/wallet-2.svg", label: "Projects", active: false },
  { icon: "/transaction-minus.svg", label: "Services", active: false },
  { icon: "/status-up.svg", label: "Skills", active: false },
];

const chartDays = [
  "Sun, 12",
  "Mon, 13",
  "Tue, 14",
  "Wed, 15",
  "Thu, 16",
  "Fri, 17",
  "Sat, 18",
];

const chartData = [
  { label: "Open:", value: "6612.31" },
  { label: "High:", value: "6940.11" },
  { label: "Low:", value: "6542.40" },
  { label: "Close:", value: "6489.58" },
];

const navLinks = [
  "Home",
  "About",
  "Projects",
  "Services",
  "Skills",
  "Contact",
];

export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative w-full h-[1146px] overflow-hidden">
      <div className="absolute top-0 left-px w-[1440px] h-[1024px] flex bg-[url(/grids.png)] bg-[100%_100%]">
        <img className="w-[1440px] h-[985px]" alt="Rays" src="/rays.png" />
      </div>

      <div className="h-[575px] top-[571px] flex flex-col w-[1440px] items-center absolute left-px">
        <div className="inline-flex flex-col h-[678px] items-start gap-2.5 p-3 relative mb-[-103.00px] rounded-3xl border-[none] bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_86%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-3xl before:[background:linear-gradient(180deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <img
            className="absolute top-[-571px] left-[-124px] w-[1440px] h-[1146px]"
            alt="Effect layer"
            src="/effect---layer.png"
          />

          <Card className="relative w-[1169.94px] h-[663.94px] mt-[-0.97px] mb-[-8.97px] ml-[-0.97px] mr-[-0.97px] bg-[#070707cc] rounded-[11.61px] overflow-hidden border-[0.97px] border-solid border-[#ffffff1a] backdrop-blur-[45.94px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(45.94px)_brightness(100%)]">
            <CardContent className="p-0 h-full">
              <aside className="flex flex-col w-[203px] h-[844px] items-start justify-between p-[12.98px] absolute top-0 left-px rounded-[8.11px]">
                <div className="flex flex-col items-start gap-[19.47px] relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                    <div className="inline-flex items-center gap-[5.68px] relative flex-[0_0_auto]">
                      <img
                        className="relative w-[26.98px] h-[29.79px] mt-[-1.12px] mb-[-6.18px] ml-[-2.25px]"
                        alt="Logo"
                        src="/logo.svg"
                      />
                      <span className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-white text-[13px] tracking-[-0.26px] leading-[19.5px] whitespace-nowrap">
                        Sahin Alam
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-[14.6px] w-[14.6px] p-0"
                    >
                      <MenuIcon className="w-[14.6px] h-[14.6px]" />
                    </Button>
                  </div>

                  <nav className="flex flex-col items-start gap-[9.73px] relative self-stretch w-full flex-[0_0_auto]">
                    <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#727272] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                      MAIN MENU
                    </span>

                    <div className="flex flex-col items-start gap-[6.49px] relative self-stretch w-full flex-[0_0_auto]">
                      {sidebarMenuItems.map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className={`flex w-[176.82px] h-[32.44px] items-center gap-[9.73px] px-[9.73px] py-[8.11px] relative rounded-[5.68px] justify-start ${
                            item.active
                              ? "bg-[#2d2d2d33] overflow-hidden border-[none] shadow-[inset_0px_-4.06px_8.11px_#ffffff1a] before:content-[''] before:absolute before:inset-0 before:p-[0.81px] before:rounded-[5.68px] before:[background:linear-gradient(285deg,rgba(246,247,250,0.2)_0%,rgba(246,247,250,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                              : ""
                          }`}
                        >
                          <img
                            className="relative w-[12.98px] h-[12.98px]"
                            alt={item.label}
                            src={item.icon}
                          />
                          <span
                            className={`relative w-fit [font-family:'Inter',Helvetica] font-medium text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap ${item.active ? "text-white mt-[-1.20px]" : "text-[#acb5bb] mt-[-3.63px]"}`}
                          >
                            {item.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </nav>
                </div>

                <div className="flex flex-col items-start gap-[12.98px] relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-[6.49px] relative self-stretch w-full flex-[0_0_auto]">
                    <Button
                      variant="ghost"
                      className="flex w-[176.82px] h-[30.82px] items-center gap-[9.73px] px-[9.73px] py-[8.11px] relative rounded-[5.68px] justify-start"
                    >
                      <SettingsIcon className="relative w-[12.98px] h-[12.98px]" />
                      <span className="relative w-fit mt-[-3.63px] [font-family:'Inter',Helvetica] font-medium text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                        SettingsIcon
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="flex w-[176.82px] h-[30.82px] items-center gap-[9.73px] px-[9.73px] py-[8.11px] relative rounded-[5.68px] justify-start"
                    >
                      <HelpCircleIcon className="relative w-[12.98px] h-[12.98px]" />
                      <span className="relative w-fit mt-[-3.63px] [font-family:'Inter',Helvetica] font-medium text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                        Help &amp; Center
                      </span>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-between px-[9.73px] py-[6.49px] relative self-stretch w-full flex-[0_0_auto] bg-[#141414] rounded-[6.49px] overflow-hidden border-[0.81px] border-solid border-[#ffffff08] shadow-[0px_4.87px_3.24px_-3.24px_#00000040,0px_6.49px_8.11px_-3.24px_#131d321a,inset_0px_-4.87px_3.24px_#0000001f] h-auto"
                  >
                    <div className="inline-flex items-center gap-[8.11px] relative flex-[0_0_auto]">
                      <div className="relative w-[25.96px] h-[25.96px] bg-[url(/avatar-32px.png)] bg-cover bg-[50%_50%]" />
                      <div className="inline-flex flex-col items-start justify-center gap-[1.62px] relative flex-[0_0_auto]">
                        <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-medium text-white text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                          Sahin Alam
                        </span>
                        <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#727272] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                          sahinhub@gmail.com
                        </span>
                      </div>
                    </div>
                    <ChevronDownIcon className="relative w-[9.73px] h-[9.73px]" />
                  </Button>
                </div>
              </aside>

              <main className="flex flex-col w-[947px] h-[844px] items-start gap-[19.47px] absolute top-[11px] left-[211px] rounded-[16.22px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                <header className="flex items-center justify-between px-[25.96px] py-[12.98px] relative self-stretch w-full flex-[0_0_auto] border-b-[0.81px] [border-bottom-style:solid] border-[#ffffff0d]">
                  <div className="inline-flex items-center gap-[8.11px] relative flex-[0_0_auto]">
                    <img
                      className="relative w-[12.98px] h-[12.98px]"
                      alt="Category"
                      src="/category.svg"
                    />
                    <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-medium text-white text-[13px] tracking-[-0.26px] leading-[19.5px] whitespace-nowrap">
                      Dashboard
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-[19.47px] relative flex-[0_0_auto]">
                    <div className="inline-flex items-center gap-[10.54px] relative flex-[0_0_auto]">
                      <SearchIcon className="relative w-[12.98px] h-[12.98px]" />
                      <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                        SearchIcon anything...
                      </span>
                    </div>

                    <Separator
                      orientation="vertical"
                      className="w-px h-[21.9px]"
                    />

                    <div className="inline-flex items-center gap-[11.36px] relative flex-[0_0_auto]">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-[29.2px] h-[29.2px] rounded-[6.49px] border-[0.81px] border-solid border-[#ffffff0d]"
                      >
                        <BellIcon className="w-[12.98px] h-[12.98px]" />
                      </Button>

                      <Badge className="inline-flex h-[29.2px] items-center gap-[8.92px] px-[9.73px] py-[6.49px] relative flex-[0_0_auto] bg-[#ffffff05] rounded-[6.49px] border-[0.81px] border-solid border-[#ffffff0d] shadow-[inset_0px_-4.06px_8.11px_#ffffff1a,0px_1.62px_8.11px_-2.43px_transparent]">
                        <WalletIcon className="w-[12.98px] h-[12.98px]" />
                        <span className="relative w-fit mt-[-1.20px] [font-family:'Inter',Helvetica] font-normal text-white text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                          227.169,85 USD
                        </span>
                      </Badge>
                    </div>
                  </div>
                </header>

                <div className="flex flex-col items-start gap-[16.22px] px-[25.96px] py-0 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="inline-flex items-start gap-[6.49px] relative flex-[0_0_auto] mr-[-5.91px]">
                    {skillStats.map((stat, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="inline-flex items-center gap-[9.73px] px-[6.49px] py-[3.24px] relative flex-[0_0_auto] bg-[#ffffff0d] rounded-[4.06px] overflow-hidden border-[0.81px] border-solid border-[#47474780]"
                      >
                        <div className="inline-flex items-center justify-center gap-[3.24px] pl-[1.62px] pr-[4.87px] py-[1.62px] relative flex-[0_0_auto] bg-[#ffffff0d] rounded-[43.8px]">
                          <img
                            className="relative flex-[0_0_auto]"
                            alt="Icons"
                            src={stat.icon}
                          />
                          <span className="relative w-fit mt-[-0.32px] [font-family:'Inter',Helvetica] font-medium text-white text-[9.7px] text-center tracking-[-0.19px] leading-[normal]">
                            {stat.name}
                          </span>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="self-stretch w-px"
                        />
                        <span className="w-fit mt-[-0.81px] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap relative [font-family:'Inter',Helvetica]">
                          {stat.value}
                        </span>
                      </Badge>
                    ))}
                  </div>

                  <Card className="flex w-[903.58px] items-center justify-center gap-[19.47px] pl-[19.47px] pr-[6.49px] py-[6.49px] relative flex-[0_0_auto] mr-[-8.11px] rounded-[8.11px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                    <CardContent className="flex flex-col items-start gap-[11.36px] relative flex-1 grow p-0">
                      <div className="flex gap-[8.11px] self-stretch w-full flex-[0_0_auto] items-center relative">
                        <WalletIcon className="w-[14.6px] h-[14.6px]" />
                        <span className="relative flex-1 mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                          WalletIcon Balance
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-[4.87px] relative flex-[0_0_auto]">
                        <span className="w-fit mt-[-0.81px] font-medium text-white text-[19.5px] tracking-[0.39px] leading-[29.2px] whitespace-nowrap relative [font-family:'Inter',Helvetica]">
                          $227.169,85
                        </span>
                        <span className="flex items-end justify-center w-[23.52px] h-[23.52px] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] relative [font-family:'Inter',Helvetica]">
                          USD
                        </span>
                      </div>
                    </CardContent>

                    <div className="flex flex-col w-[83.54px] gap-[11.36px] items-center relative">
                      <Button className="flex w-[83.54px] h-[26.77px] items-center justify-center gap-[8.11px] px-[19.47px] py-[10.54px] relative bg-white rounded-[4.87px] border-[0.81px] border-solid border-[#ffffff26] shadow-[inset_0px_6px_15.01px_#ffffff1c,0px_0px_0px_3px_#becaea08] hover:bg-white/90">
                        <span className="relative w-fit mt-[-3.97px] mb-[-2.35px] [font-family:'Inter',Helvetica] font-semibold text-[#181818] text-[9.7px] text-center tracking-[-0.19px] leading-[normal]">
                          Topup
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-[26.76px] gap-2.5 px-3.5 py-0 self-stretch w-full rounded-[4.87px] border-[none] shadow-[inset_0px_0px_25px_1px_#ffffff1a] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] flex items-center justify-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[4.87px] before:[background:linear-gradient(174deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                      >
                        <span className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-white text-[9.7px] text-center tracking-[-0.19px] leading-[normal]">
                          More
                        </span>
                      </Button>
                    </div>

                    <Separator
                      orientation="vertical"
                      className="self-stretch w-px"
                    />

                    <div className="flex w-[543.44px] items-start gap-[6.49px] relative">
                      <Card className="flex flex-col items-start gap-[6.49px] p-[12.98px] relative flex-1 grow bg-[#ffffff05] rounded-[8.11px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                        <CardContent className="p-0 w-full">
                          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                            <div className="flex w-[198.72px] items-center gap-[8.11px] relative">
                              <div className="relative w-[2.43px] h-[16.22px] bg-[#ebac30] rounded-[8.11px]" />
                              <span className="relative flex-1 mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                                BTC Balance
                              </span>
                            </div>
                            <img
                              className="relative flex-[0_0_auto]"
                              alt="Icons"
                              src="/icons-9.svg"
                            />
                          </div>

                          <div className="flex items-end justify-between relative self-stretch w-full flex-[0_0_auto]">
                            <div className="inline-flex items-center gap-[4.87px] relative flex-[0_0_auto]">
                              <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-medium text-white text-[19.5px] tracking-[0.39px] leading-[29.2px] whitespace-nowrap">
                                0.34545
                              </span>
                              <span className="flex items-end justify-center w-[23.52px] h-[23.52px] font-normal text-[#acb5bb] relative [font-family:'Inter',Helvetica] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                                BTC
                              </span>
                            </div>
                            <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                              21900,84 USD
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="flex flex-col items-start gap-[6.49px] p-[12.98px] relative flex-1 grow bg-[#ffffff05] rounded-[8.11px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                        <CardContent className="p-0 w-full">
                          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                            <div className="flex w-[198.72px] items-center gap-[8.11px] relative">
                              <div className="relative w-[2.43px] h-[16.22px] bg-[#dbdbdb] rounded-[8.11px]" />
                              <span className="relative flex-1 mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                                ETH Balance
                              </span>
                            </div>
                            <img
                              className="relative flex-[0_0_auto]"
                              alt="Icons"
                              src="/icons-4.svg"
                            />
                          </div>

                          <div className="flex items-end justify-between relative self-stretch w-full flex-[0_0_auto]">
                            <div className="inline-flex items-center gap-[4.87px] relative flex-[0_0_auto]">
                              <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-medium text-white text-[19.5px] tracking-[0.39px] leading-[29.2px] whitespace-nowrap">
                                12,345
                              </span>
                              <span className="relative flex items-end justify-center w-[23.52px] h-[23.52px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                                ETH
                              </span>
                            </div>
                            <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                              37870,88 USD
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Card>

                  <div className="flex items-start gap-[16.22px] relative self-stretch w-full flex-[0_0_auto]">
                    <Card className="flex flex-col w-[595.36px] h-[347.16px] items-start gap-[16.22px] pt-[16.22px] pb-[11.36px] px-[19.47px] relative bg-[#ffffff05] rounded-[8.11px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                      <CardContent className="p-0 w-full h-full flex flex-col gap-[16.22px]">
                        <img
                          className="absolute top-[79px] left-[19px] w-[556px] h-52"
                          alt="Line"
                          src="/line-5.svg"
                        />

                        <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                          <Button
                            variant="outline"
                            className="inline-flex items-center gap-[4.87px] p-[4.87px] relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[4.87px] overflow-hidden border-[0.81px] border-solid border-[#47474733] h-auto"
                          >
                            <img
                              className="relative flex-[0_0_auto]"
                              alt="Icons"
                              src="/icons-1.svg"
                            />
                            <span className="w-fit font-medium text-white whitespace-nowrap relative [font-family:'Inter',Helvetica] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                              BTC Overview
                            </span>
                            <ChevronDownIcon className="w-[11.36px] h-[11.36px]" />
                          </Button>

                          <div className="inline-flex items-center gap-[9.73px] relative flex-[0_0_auto]">
                            <div className="inline-flex items-center gap-[3.24px] p-[3.24px] relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[4.87px] overflow-hidden border-[none] before:content-[''] before:absolute before:inset-0 before:p-[0.81px] before:rounded-[4.87px] before:[background:linear-gradient(0deg,rgba(41,41,41,1)_0%,rgba(71,71,71,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
                              <Button
                                variant="ghost"
                                className="inline-flex h-[17.84px] items-center justify-center gap-[12.98px] p-[6.49px] relative flex-[0_0_auto] rounded-[3.24px]"
                              >
                                <span className="relative w-fit mt-[-5.88px] mb-[-4.26px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                  1 Day
                                </span>
                              </Button>

                              <Button className="inline-flex h-[17.84px] items-center gap-[8.92px] p-[6.49px] relative flex-[0_0_auto] bg-[#474747] rounded-[3.24px] overflow-hidden shadow-[inset_0px_-4.06px_8.11px_#ffffff1a,0px_4.87px_8.11px_-2.43px_#00000040]">
                                <span className="mt-[-5.88px] mb-[-4.26px] text-white relative w-fit [font-family:'Inter',Helvetica] font-normal text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                  7 Days
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                className="inline-flex h-[17.84px] items-center justify-center gap-[12.98px] p-[6.49px] relative flex-[0_0_auto] rounded-[3.24px]"
                              >
                                <span className="mt-[-5.88px] mb-[-4.26px] text-[#acb5bb] relative w-fit [font-family:'Inter',Helvetica] font-normal text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                  30 Days
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                className="inline-flex h-[17.84px] items-center justify-center gap-[12.98px] p-[6.49px] relative flex-[0_0_auto] rounded-[3.24px]"
                              >
                                <span className="relative w-fit mt-[-5.88px] mb-[-4.26px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                  Custom
                                </span>
                              </Button>
                            </div>

                            <div className="inline-flex h-[24.33px] items-center gap-[3.24px] p-[3.24px] relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[4.87px] overflow-hidden border-[none] shadow-[0px_4.87px_8.11px_-2.43px_#00000040] before:content-[''] before:absolute before:inset-0 before:p-[0.81px] before:rounded-[4.87px] before:[background:linear-gradient(0deg,rgba(41,41,41,1)_0%,rgba(71,71,71,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
                              <Button className="flex w-[17.84px] h-[17.84px] items-center justify-center gap-[12.98px] px-[6.49px] py-[4.87px] relative bg-[#474747] rounded-[4.06px] overflow-hidden shadow-[0px_4.87px_8.11px_-2.43px_#00000040,inset_0px_-4.06px_8.11px_#ffffff1a] p-0">
                                <img
                                  className="relative w-[12.98px] h-[12.98px] mt-[-2.43px] mb-[-2.43px] ml-[-4.06px] mr-[-4.06px]"
                                  alt="Chart candle"
                                  src="/chart-candle.svg"
                                />
                              </Button>

                              <Button
                                variant="ghost"
                                className="flex w-[17.84px] h-[17.84px] items-center justify-center gap-[12.98px] px-[6.49px] py-[4.87px] relative rounded-[4.06px] p-0"
                              >
                                <img
                                  className="relative w-[12.98px] h-[12.98px] mt-[-2.43px] mb-[-2.43px] ml-[-4.06px] mr-[-4.06px]"
                                  alt="Chart area"
                                  src="/chart-area.svg"
                                />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <img
                          className="relative flex-1 self-stretch w-full grow"
                          alt="Stat"
                          src="/stat.svg"
                        />

                        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                          <Separator className="relative self-stretch w-full h-px" />

                          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
                            {chartDays.map((day, index) => (
                              <div
                                key={index}
                                className="flex flex-col items-center gap-[3.24px] relative flex-1 grow"
                              >
                                <div className="relative w-px h-[4.87px] bg-[#474747]" />
                                <span className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] text-center tracking-[-0.10px] leading-[14.6px]">
                                  {day}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="absolute top-[90px] left-[15px] w-[565px] h-[220px]">
                          <Separator className="absolute top-3.5 left-0 w-[565px] h-px" />

                          <Separator
                            orientation="vertical"
                            className="absolute left-[358px] bottom-px w-[9px] h-[209px]"
                          />

                          <Card className="inline-flex flex-col items-start gap-[4.87px] p-[8.11px] absolute top-3.5 left-[calc(50.00%_+_88px)] bg-[#1c1c1c] rounded-[0px_4.87px_4.87px_4.87px] overflow-hidden border-[0.81px] border-solid border-[#474747] shadow-[inset_0px_-3.24px_3.24px_#0000000a,0px_11.36px_8.92px_-3.24px_#0000004c]">
                            <CardContent className="p-0">
                              <div className="absolute top-[calc(50.00%_-_113px)] left-[25px] w-[38px] h-[81px] bg-[#d9d9d980] rotate-[54.42deg] blur-[25.96px] opacity-50" />

                              <span className="mt-[-0.81px] text-white relative w-fit [font-family:'Inter',Helvetica] font-normal text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                16 Jul 2023
                              </span>

                              <div className="absolute top-[calc(50.00%_-_97px)] left-[138px] w-[38px] h-[81px] bg-[#d9d9d980] rotate-[54.42deg] blur-[25.96px]" />

                              {chartData.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]"
                                >
                                  <span className="relative w-[40.56px] mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#727272] text-[9.7px] tracking-[-0.10px] leading-[14.6px]">
                                    {item.label}
                                  </span>
                                  <span className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-white text-[9.7px] tracking-[-0.19px] leading-[normal]">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="inline-flex flex-col items-start gap-[4.87px] p-[8.11px] absolute top-0 left-[calc(50.00%_-_277px)] bg-[#1c1c1c] rounded-[4.87px] overflow-hidden border-[0.81px] border-solid border-[#474747] shadow-[inset_0px_-3.24px_3.24px_#0000000a,0px_11.36px_8.92px_-3.24px_#0000004c]">
                            <CardContent className="p-0">
                              <div className="absolute top-[calc(50.00%_-_90px)] left-[25px] w-[38px] h-[81px] bg-[#d9d9d980] rotate-[54.42deg] blur-[25.96px] opacity-50" />
                              <span className="relative w-fit mt-[-0.81px] [font-family:'Inter',Helvetica] font-medium text-white text-[9.7px] tracking-[-0.19px] leading-[normal]">
                                6612.31
                              </span>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col items-start gap-[13.79px] p-[19.47px] relative flex-1 grow bg-[#ffffff05] rounded-[8.11px] overflow-hidden border-[0.81px] border-solid border-[#ffffff0d]">
                      <CardContent className="p-0 w-full flex flex-col gap-[13.79px]">
                        <div className="flex items-center gap-[9.73px] relative self-stretch w-full flex-[0_0_auto]">
                          <h3 className="relative flex-1 mt-[-0.81px] [font-family:'Inter',Helvetica] font-semibold text-white text-[13px] tracking-[-0.26px] leading-[19.5px]">
                            Exchange
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-[12.98px] h-[12.98px] p-0"
                          >
                            <MoreHorizontalIcon className="w-[12.98px] h-[12.98px]" />
                          </Button>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-[1.62px] relative self-stretch w-full flex-[0_0_auto]">
                          <div className="flex flex-col items-start justify-center gap-[6.49px] relative self-stretch w-full flex-[0_0_auto]">
                            <div className="flex justify-center gap-[6.49px] self-stretch w-full flex-[0_0_auto] items-center relative">
                              <span className="relative flex-1 h-[17.03px] mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                                Pay
                              </span>
                              <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                0 BTC : 0.00 USD
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-[9.73px] pl-[12.98px] pr-[4.87px] py-[4.87px] relative self-stretch w-full flex-[0_0_auto] rounded-[4.87px] border-[0.81px] border-solid border-[#ffffff0d]">
                              <Input
                                placeholder="Input nominal..."
                                className="relative flex-1 [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                              />

                              <Button
                                variant="outline"
                                className="inline-flex items-center gap-[4.87px] p-[4.87px] relative flex-[0_0_auto] bg-[#ffffff0f] rounded-[4.06px] overflow-hidden shadow-[0px_4.87px_8.11px_-2.43px_#00000040] h-auto"
                              >
                                <img
                                  className="relative flex-[0_0_auto]"
                                  alt="Icons"
                                  src="/icons-1.svg"
                                />
                                <span className="w-fit font-medium text-white whitespace-nowrap relative [font-family:'Inter',Helvetica] text-[11.4px] tracking-[-0.23px] leading-[17.0px]">
                                  BTC
                                </span>
                                <ChevronDownIcon className="w-[11.36px] h-[11.36px]" />
                              </Button>
                            </div>

                            <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                              Balance : 1.1241121 BTC
                            </span>
                          </div>

                          <div className="flex items-center gap-[9.73px] relative self-stretch w-full flex-[0_0_auto]">
                            <Separator className="relative flex-1 grow h-px ml-[-0.41px]" />

                            <Button
                              variant="ghost"
                              size="icon"
                              className="inline-flex items-start gap-[8.11px] p-[6.49px] bg-[#ffffff0d] rounded-[81.11px] relative flex-[0_0_auto]"
                            >
                              <ArrowDownUpIcon className="w-[16.22px] h-[16.22px]" />
                            </Button>

                            <Separator className="relative flex-1 grow h-px mr-[-0.41px]" />
                          </div>

                          <div className="flex flex-col items-start justify-center gap-[6.49px] relative self-stretch w-full flex-[0_0_auto]">
                            <div className="flex justify-center gap-[6.49px] self-stretch w-full flex-[0_0_auto] items-center relative">
                              <span className="relative flex-1 h-[17.03px] mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                                To
                              </span>
                              <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px] whitespace-nowrap">
                                0 ETH : 0.00 USD
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-[9.73px] pl-[12.98px] pr-[4.87px] py-[4.87px] relative self-stretch w-full flex-[0_0_auto] rounded-[4.87px] border-[0.81px] border-solid border-[#ffffff0d]">
                              <Input
                                placeholder="Input nominal..."
                                className="relative flex-1 [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[11.4px] tracking-[-0.23px] leading-[17.0px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                              />

                              <Button
                                variant="outline"
                                className="inline-flex items-center gap-[4.87px] p-[4.87px] relative flex-[0_0_auto] bg-[#ffffff0f] rounded-[4.06px] overflow-hidden shadow-[0px_4.87px_8.11px_-2.43px_#00000040] h-auto"
                              >
                                <img
                                  className="relative flex-[0_0_auto]"
                                  alt="Icons"
                                  src="/icons-5.svg"
                                />
                                <span className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-white text-[11.4px] tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                                  ETH
                                </span>
                                <ChevronDownIcon className="w-[11.36px] h-[11.36px]" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-[8.11px] p-[8.11px] relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0f] rounded-[6.49px] overflow-hidden shadow-[0px_4.87px_8.11px_-2.43px_#00000040]">
                          <InfoIcon className="w-[12.98px] h-[12.98px]" />
                          <span className="relative flex-1 mt-[-0.81px] [font-family:'Inter',Helvetica] font-normal text-[#acb5bb] text-[9.7px] tracking-[-0.10px] leading-[14.6px]">
                            current rate 1 eth = 3067.71 USD
                          </span>
                        </div>

                        <Button className="w-[244.96px] h-[37.31px] gap-[8.11px] px-[19.47px] py-[10.54px] bg-white rounded-[4.87px] border-[0.81px] border-solid border-[#ffffff26] shadow-[inset_0px_6px_15.01px_#ffffff1c,0px_0px_0px_3px_#becaea08] hover:bg-white/90">
                          <span className="relative w-fit mt-[-1.20px] [font-family:'Inter',Helvetica] font-semibold text-[#1a1a1b] text-[11.4px] text-center tracking-[-0.23px] leading-[17.0px] whitespace-nowrap">
                            Swap
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </main>
            </CardContent>
          </Card>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-[266px] left-[calc(50.00%_-_61px)] w-[122px] h-[122px] p-0 hover:bg-transparent"
        >
          <img
            className="w-[122px] h-[122px]"
            alt="Play button"
            src="/play-button.svg"
          />
        </Button>

        <div className="absolute left-px bottom-[-11px] w-[1440px] h-[312px] bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,1)_75%)]" />
      </div>

      <div className="gap-[125px] top-0 flex flex-col w-[1440px] items-center absolute left-px">
        <header className="flex items-center justify-between px-[100px] py-4 relative self-stretch w-full flex-[0_0_auto] bg-[#0505051a] [border-top-style:none] [border-right-style:none] border-b [border-bottom-style:solid] [border-left-style:none] border-[#ffffff1a] backdrop-blur-[4.25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(4.25px)_brightness(100%)]">
          <div className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]">
            <img className="relative w-8 h-8" alt="Logo" src="/logo-2.svg" />
            <span className="relative flex items-center justify-center w-fit mt-[-1.00px] bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_20%,rgba(255,255,255,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Geist',Helvetica] font-medium text-transparent text-xl tracking-[0] leading-[34.0px] whitespace-nowrap">
              Sahin Alam
            </span>
          </div>

          <nav className="flex w-[582px] items-center justify-between relative">
            {navLinks.map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`relative flex items-center justify-center w-fit mt-[-1.00px] text-sm text-center tracking-[0] leading-5 whitespace-nowrap h-auto p-0 ${
                  index === 0
                    ? "[font-family:'Inter_Display-Medium',Helvetica] font-medium text-white"
                    : "opacity-80 [font-family:'Inter_Display-Regular',Helvetica] font-normal text-white hover:opacity-100"
                }`}
              >
                {link}
              </Button>
            ))}
          </nav>

          <Button className="inline-flex gap-2 px-3.5 py-2.5 flex-[0_0_auto] bg-[#1c1c1c] rounded-lg border border-solid border-[#ffffff1a] items-center relative hover:bg-[#1c1c1c]/90">
            <span className="w-fit mt-[-1.00px] [font-family:'Geist',Helvetica] font-medium text-white text-sm text-center tracking-[0] leading-5 whitespace-nowrap flex items-center justify-center relative">
              Contact Me
            </span>
          </Button>

          <div className="absolute left-[calc(50.00%_-_719px)] bottom-0 w-[1439px] h-px [background:radial-gradient(50%_50%_at_50%_50%,rgba(224,224,224,1)_0%,rgba(225,225,225,0)_100%)]" />
        </header>

        <div className="w-[764px] items-center gap-[26px] relative flex-[0_0_auto] flex flex-col">
          <div className="flex flex-col items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
            <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-[64px] text-center tracking-[-3.00px] leading-[72.0px] flex items-center justify-center">
              Full Stack Web Developer & Designer
            </h1>

            <p className="relative flex items-center justify-center w-[696px] opacity-80 [font-family:'Inter_Display-Regular',Helvetica] font-normal text-white text-xl text-center tracking-[-0.20px] leading-[32.0px]">
              Building modern, responsive web solutions with 2+ years of experience.
              Specialized in WordPress, React, and Full Stack Development.
            </p>
          </div>

          <Button className="inline-flex justify-center gap-2 px-3.5 py-2.5 flex-[0_0_auto] rounded-lg overflow-hidden border-[none] shadow-[0px_1px_2px_#b0b0b01a,0px_4px_4px_#b0b0b017,0px_10px_6px_#b0b0b00d,0px_17px_7px_#b0b0b003,0px_27px_7px_transparent] bg-[linear-gradient(181deg,rgba(28,28,28,0.4)_0%,rgba(28,28,28,0)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:opacity-90">
            <span className="flex justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#050505] text-sm text-center tracking-[0] leading-5 whitespace-nowrap items-center relative">
              View My Work
            </span>
            <ArrowUpRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
