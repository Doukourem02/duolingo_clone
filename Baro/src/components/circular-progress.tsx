import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size: number;
  strokeWidth: number;
  percentage: number;
  children?: React.ReactNode;
};

export const CircularProgress = ({ size, strokeWidth, percentage, children }: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Number.isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100);
  const dashOffset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#4ade80"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children}
    </View>
  );
};
