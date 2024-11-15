import { Display } from "../enums/display.enum";
import { NodeType } from "../enums/node-type.enum";
import { CanvasElement } from "./canvas-element";

export default class Canvas {
    nodeType = NodeType.Canvas;
    element: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    children: CanvasElement[] = [];
    startX: number = 0;
    startY: number = 0;
    display = Display.Block;
    constructor() {
      this.element = document.createElement("canvas");
      this.ctx = this.element.getContext("2d");
      this.width = this.element.width = 500;
      this.height = this.element.height = 500;
    }

    createElement(type: NodeType) {
      return new CanvasElement(type);
    }

    appendChild(el: CanvasElement | CanvasElement[]) {
      CanvasElement.prototype.appendChild.apply(this, [el]);
      this.children.forEach((item) => {
        this.draw(item);
      });
    }

    draw(el: CanvasElement) {
      this.ctx.beginPath();
      this.ctx.fillStyle = el.fillStyle;
      if (el.nodeType === "text") {
        this.ctx.textAlign = el.textAlign;
        this.ctx.font = el.font;
        this.ctx.fillText(el.textContent, el.startX, el.startY);
        const { width } = this.ctx.measureText(el.textContent);
        el.width = width;
      }

      if (el.nodeType === "view") {
        if (el.fillStyle) {
          this.ctx.fillRect(el.startX, el.startY, el.width, el.height);
        } else {
          this.ctx.rect(el.startX, el.startY, el.width, el.height);
        }
      }
      this.ctx.closePath();

      if (el.children.length) {
        el.children.forEach((item) => {
          this.draw(item);
        });
      }
    }
  }