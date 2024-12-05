import "react";

declare module "react" {
  interface CSSProperties {
    "--value"?: string | number;
    "--size"?: string;
    "--thickness"?: string;
  }
}
