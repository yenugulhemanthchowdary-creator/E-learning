declare module "*.jsx" {
  import type { ComponentType } from "react";
  export const ChatBox: ComponentType<any>;
  const DefaultExport: ComponentType<any>;
  export default DefaultExport;
}
