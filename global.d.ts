// CSS 모듈 타입 선언 - TypeScript가 CSS import를 인식하도록 함
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
