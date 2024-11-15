import { Display } from "../enums/display.enum";
import { AlignItems, FlexDirection, JustifyContent } from "../enums/flex.enum";
import { NodeType } from "../enums/node-type.enum";
import { TextAlign } from "../enums/text-align.enum";

export class CanvasElement {
    nodeType: NodeType;
    id: string | null = null;
    children: CanvasElement[];
    parent: CanvasElement | null = null;
    _width: number;
    _height: number;
    _textContent: string;
    _fontSize: number;
    previousSibling: CanvasElement | null = null;
    nextSibling: CanvasElement | null = null;
    alignItems: AlignItems = AlignItems.FlexStart;
    index: number | null = null;
    display = Display.Block;
    justifyContent = JustifyContent.FlexStart;
    flexDirection = FlexDirection.Row;
    fillStyle: string = '#000';
    textAlign: TextAlign.Left;

    constructor(type: NodeType) {
      this.nodeType = type;
      this.children = [];
      this.parent = null;
      this._width = 0;
      this._height = 0;
      this._textContent = "";
      this._fontSize = 8;
      this.previousSibling = null;
      this.nextSibling = null;
    }

    get fontSize() {
      return this._fontSize;
    }

    set fontSize(val) {
      this._fontSize = val;
      this._width = this.getTextWidth();
    }

    getTextWidth() {
      const measureText = this.getMeasureText();
      return measureText.width;
    }

    getMeasureText() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = this.font;
      ctx.fillText(this._textContent, 0, 0);
      return ctx.measureText(this._textContent);
    }

    get font() {
      return `${this.fontSize}px Arial`;
    }

    get textContent() {
      return this._textContent;
    }

    set textContent(val) {
      this._textContent = val;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = this.font;
      ctx.fillText(this._textContent, 0, 0);
      this._width = ctx.measureText(val).width;
    }

    getTextHeight() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = this.font;
      const metrics = ctx.measureText(this._textContent);

      // 该字体的高度
      const fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      // 当前行文本高度
      const actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      return actualHeight;
    }

    get startX() {
      let startX = 0;
      const { alignItems, justifyContent, display, flexDirection } =
        this.parent;

      if (display === Display.Block) {
        startX = this.parent.startX;
      } else if (display === Display.Flex) {
        if (flexDirection === FlexDirection.Row) {
          switch (alignItems) {
            case AlignItems.FlexStart:
              startX = this.parent.startX;
              break;
            case AlignItems.Center:
              startX =
                this.parent.startX + this.parent.width / 2 - this.width / 2;
              break;
            case AlignItems.FlexEnd:
              startX = this.parent.startX + this.parent.width - this.width;
              break;
          }

          switch (justifyContent) {
            case JustifyContent.SpaceBetween:
              const spacing =
                this.parent.width / (this.parent.children.length + 1);
              startX =
                this.parent.startX +
                spacing * (this.index + 1) -
                this.width / 2;
              break;
          }
        } else if (flexDirection === FlexDirection.Column) {
          switch (alignItems) {
            case AlignItems.FlexStart:
              startX = this.parent.startX;
              break;
            case AlignItems.Center:
                startX = this.parent.startX + this.parent.width / 2 - this.width / 2;
              break;
          }
        }
      }

      return startX;
    }

    get width() {
      if (!this._width) {
        if (this.nodeType === NodeType.View) {
          this._width = this.parent.width;
        }
      }
      return this._width;
    }

    set width(val) {
      this._width = val;
    }

    get startY() {
      const prev = this.previousSibling;
      let startY = 0;
      const { display, justifyContent, alignItems, flexDirection } =
        this.parent;

      if (display === Display.Block) {
        if (prev) {
          startY = prev.startY + prev.height;
        } else {
          startY = this.parent.startY;
        }
        if (this.nodeType === NodeType.Text) {
          startY += this.height;
        }
      } else if (display === Display.Flex) {
        if (flexDirection === FlexDirection.Row) {
          switch (alignItems) {
            case AlignItems.Center:
              if (this.nodeType === NodeType.Text) {
                startY += this.parent.height / 2 + this.height / 2;
              } else {
                startY += this.parent.height / 2 - this.height / 2;
              }
              break;
          }

          switch (justifyContent) {
            case JustifyContent.SpaceBetween:
              startY = this.parent.startY;
              break;
          }
        } else if (flexDirection === FlexDirection.Column) {
          switch (alignItems) {
            case AlignItems.FlexStart:
              if (prev) {
                startY = prev.startY + prev.height;
              } else if (this.parent) {
                startY = this.parent.startY;
              }

              if (this.nodeType == NodeType.Text) {
                startY += this.height;
              }
              break;
            case AlignItems.Center:
              if (prev) {
                if (this.nodeType === NodeType.Text ) {
                  const firstTextNode = this.parent.children.find(item => item.nodeType === NodeType.Text);
                  startY = prev.startY + this.height;
                  if (firstTextNode === this) {
                    startY += prev.height;
                  }
                } else {
                  startY = prev.startY + prev.height;
                }
              } else {
                const childH = this.parent.children.reduce(
                  (pre, cur) => (pre += cur.height),
                  0
                );
                const top = (this.parent.height - childH) / 2;
                startY = this.parent.startY - top;
              }
              break;
          }
        }
      }

      return startY;
    }

    set height(val) {
      if (this.nodeType === NodeType.Text) {
        throw new Error("text节点不能设置高度");
      }

      this._height = val;
    }

    get height() {
      if (this.nodeType === NodeType.Text) {
        this._height = this.getTextHeight();
        return this._height;
      }

      // 计算高度时，如果子元素是flex布局，则计算其高度
      if (!this._height) {
        const children = this.children;
        if (children.length) {
          if (this.display === Display.Flex) {
            switch (this.flexDirection) {
              case FlexDirection.Row:
                this._height = Math.max(
                  ...children.map((item) => item.height)
                );
                break;
              case FlexDirection.Column:
                this._height = children.reduce((pre, cur) => {
                  return pre + cur.height;
                }, 0);
                break;
            }
          }
        }
      }

      return this._height;
    }

    get center() {
      return {
        x: this.startX + this.width / 2,  
        y: this.startY + this.height / 2,
      };
    }

    appendChild(el: CanvasElement | CanvasElement[]) {
      if (Array.isArray(el)) {
        this.children.push(...el);
        el.forEach((item) => {
          item.parent = this;
        });
      } else {
        this.children.push(el);
        el.parent = this;
      }
      // 初始化children相关属性
      this.children.forEach((item, index) => {
        item.previousSibling = this.children[index - 1] ?? null;
        item.nextSibling = this.children[index + 1] ?? null;
        item.index = index;
      });
    }
  }