import { cn } from "@/lib/utils";

/**
 * An avatar as an image (an SVG data URL from the engine). Plain <img> isolates each SVG's ids and
 * needs no optimisation, so next/image adds nothing here.
 */
export const AvatarImg = ({
  src,
  alt = "",
  className,
  style,
  ref,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLImageElement>;
}) => (
  // eslint-disable-next-line @next/next/no-img-element -- see above
  <img
    ref={ref}
    src={src}
    alt={alt}
    draggable={false}
    decoding="async"
    className={cn("block select-none", className)}
    style={style}
  />
);
