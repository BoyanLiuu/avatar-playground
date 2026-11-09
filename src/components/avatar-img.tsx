import { cn } from "@/lib/utils";

/**
 * An avatar as an image: local SVG files now (fixtures), SVG data URLs from M2. Plain <img>
 * isolates each SVG's ids and needs no optimisation, so next/image adds nothing here.
 */
export const AvatarImg = ({
  src,
  alt = "",
  className,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  // eslint-disable-next-line @next/next/no-img-element -- see above
  <img
    src={src}
    alt={alt}
    draggable={false}
    decoding="async"
    className={cn("block select-none", className)}
    style={style}
  />
);
