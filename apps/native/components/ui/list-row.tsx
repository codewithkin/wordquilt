import { cn } from "heroui-native";
import { Pressable, View } from "react-native";

import { Text } from "./text";

/**
 * A row in a list — the shape Store, Settings, Fabric and the Wall all share.
 *
 * The `right` slot has two treatments and they mean different things:
 *
 *   price   accent pill. Something can be bought.
 *   quiet   muted text. A state, a value, or something already owned.
 *
 * Keeping them apart matters: "Yours" and "$2.99" must never look alike, or a
 * player cannot tell at a glance what would cost money. One visual meaning per
 * treatment (systems/02-design-system.md).
 */

export interface ListRowProps {
  title: string;
  sub?: string;
  /** Text for the right-hand slot. */
  right?: string;
  /** `price` renders an accent pill; `quiet` renders muted text. */
  rightStyle?: "price" | "quiet";
  onPress?: () => void;
  /** Leading element — a swatch, a patch grid. */
  leading?: React.ReactNode;
  className?: string;
}

export function ListRow({
  title,
  sub,
  right,
  rightStyle = "quiet",
  onPress,
  leading,
  className,
}: ListRowProps) {
  const body = (
    <View
      className={cn(
        "min-h-[66px] flex-row items-center gap-[14px] px-[18px] py-4",
        className,
      )}
    >
      {leading}
      <View className="flex-1 gap-[2px]">
        <Text variant="listTitle">{title}</Text>
        {sub ? <Text variant="meta">{sub}</Text> : null}
      </View>

      {right ? (
        rightStyle === "price" ? (
          <View className="rounded-pill border-2 border-line bg-accent px-4 py-[10px] shadow-chip">
            <Text variant="wordChip" className="text-on-accent">
              {right}
            </Text>
          </View>
        ) : (
          <Text variant="meta" className="text-muted">
            {right}
          </Text>
        )
      ) : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, sub, right].filter(Boolean).join(", ")}
    >
      {body}
    </Pressable>
  );
}
