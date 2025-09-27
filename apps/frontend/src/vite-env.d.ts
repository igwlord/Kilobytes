/// <reference types="vite/client" />

// Allow importing CSS files without type errors
declare module '*.css' {
  const content: string;
  export default content;
}
