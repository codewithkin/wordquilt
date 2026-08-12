import { colors, seam as seamTokens } from "@wordquilt/tokens";
import { useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useAppTheme } from "@/contexts/app-theme-context";

/**
 * The seam — where the cream sheet curves up over the terracotta field.
 *
 * ── The geometry, and why it cannot be a borderRadius ───────────────────────
 * The design draws the sheet as:
 *
 *   left: -8%   width: 116%   border-top-{left,right}-radius: 50% 74px
 *
 * That is an ELLIPTICAL corner radius: 50% of the width horizontally, 74px
 * vertically. React Native supports only circular radii, so this cannot be a
 * View (D-006). It also must not be approximated with a circular radius — the
 * curve is roughly 4x wider than it is tall and the difference is obvious.
 *
 * The useful observation: because BOTH top corners have a horizontal radius of
 * 50% of the width, the two corner arcs meet exactly at the centre. The top
 * edge is therefore one continuous half-ellipse across the full width, not two
 * corners with a flat span between them — which makes it a single SVG arc:
 *
 *   M 0,74  A (w/2),74 0 0 1 w,74   L w,h   L 0,h   Z
 *
 * ── Layout contract ─────────────────────────────────────────────────────────
 * This draws ONLY the curved strip. The screen's own background is already the
 * sheet colour, so everything below the strip is covered without another layer.
 * The strip is 74px tall and sits `overlap` (40px, D-007) above the field's
 * base, so its lower portion spills past the field and onto the sheet — which
 * is exactly what makes the curve read as cloth lying over the band.
 */

export interface SeamProps {
  /** Height of the terracotta field this seam sits at the bottom of. */
  fieldHeight: number;
}

export function Seam({ fieldHeight }: SeamProps) {
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const ramp = isDark ? colors.dark : colors.light;

  // The sheet is wider than the screen and hangs off both edges, so the arc's
  // shallow ends are cropped away and only its centre is seen. Without the
  // overhang the curve would visibly flatten into the screen edges.
  const overhang = (seamTokens.overhangPercent / 100) * width;
  const sheetWidth = width + overhang * 2;
  const rx = sheetWidth / 2;
  const ry = seamTokens.curveHeight;

  // Draw one pixel taller than the curve so the fill's bottom edge is never
  // visible as a hairline against the sheet below it.
  const height = ry + 1;

  const dome = `M 0,${ry} A ${rx},${ry} 0 0 1 ${sheetWidth},${ry} L ${sheetWidth},${height} L 0,${height} Z`;
  const edge = `M 0,${ry} A ${rx},${ry} 0 0 1 ${sheetWidth},${ry}`;

  // In dark mode the seam's border is a soft cream rather than the solid ink of
  // light mode — a hard dark line against a dark field reads as a crack.
  const edgeColor = isDark ? "rgba(244,237,223,0.35)" : ramp.ink;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: -overhang,
        top: fieldHeight - seamTokens.overlap,
        width: sheetWidth,
        height,
      }}
    >
      <Svg width={sheetWidth} height={height}>
        <Path d={dome} fill={ramp.sheet} />
        <Path
          d={edge}
          fill="none"
          stroke={edgeColor}
          strokeWidth={seamTokens.borderWidth}
        />
      </Svg>
    </View>
  );
}
