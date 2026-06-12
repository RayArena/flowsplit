import { cn, getInitials, generateAvatarColor } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showRing?: boolean;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-20 h-20 text-2xl",
};

const pixelMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  "2xl": 80,
};

export function Avatar({ src, name, size = "md", className, showRing = false }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const px = pixelMap[size];
  const color = generateAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative rounded-full flex-shrink-0 overflow-hidden",
        sizeClass,
        showRing && "ring-2 ring-[#6366f1]/40 ring-offset-2 ring-offset-[#030712]",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ name: string; avatar?: string | null }>;
  max?: number;
  size?: AvatarProps["size"];
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <div key={i} style={{ zIndex: visible.length - i }}>
          <Avatar
            src={user.avatar}
            name={user.name}
            size={size}
            className="ring-2 ring-[#030712]"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-[#334155] text-[#94a3b8] font-medium ring-2 ring-[#030712] text-xs",
            sizeMap[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
