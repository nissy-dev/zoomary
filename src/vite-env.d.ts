/// <reference types="vite/client" />
/// <reference types="@types/dom-chromium-ai" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
