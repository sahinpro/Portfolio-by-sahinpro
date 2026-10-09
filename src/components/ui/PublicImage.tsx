import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";

type PublicImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: ImageProps["style"];
} & (
  | { fill: true; width?: never; height?: never }
  | { fill?: false; width: number; height: number }
);

export function PublicImage({
  src,
  alt,
  className,
  priority = false,
  sizes,
  style,
  fill,
  width,
  height,
}: PublicImageProps): JSX.Element {
  const shared: Pick<
    ImageProps,
    "src" | "alt" | "priority" | "sizes" | "className" | "style"
  > = {
    src,
    alt,
    priority,
    sizes,
    className: cn(className),
    style,
  };

  if (fill) {
    return <Image {...shared} fill />;
  }

  return <Image {...shared} width={width!} height={height!} />;
}
