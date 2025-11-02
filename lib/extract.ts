function ensurePdfJsPolyfills(): void {
  const globals = globalThis as Record<string, unknown>;

  if (typeof globals.Path2D === "undefined") {
    globals.Path2D = class {
      constructor(_path?: unknown) {
        void _path;
      }
      addPath(..._args: unknown[]): void {
        void _args;
      }
      closePath(): void {
        // no-op
      }
    };
  }

  if (typeof globals.DOMMatrix === "undefined") {
    const toComponents = (value: unknown) => {
      if (Array.isArray(value) || ArrayBuffer.isView(value)) {
        const arr = Array.from(value as ArrayLike<number>);
        return {
          a: arr[0] ?? 1,
          b: arr[1] ?? 0,
          c: arr[2] ?? 0,
          d: arr[3] ?? 1,
          e: arr[4] ?? 0,
          f: arr[5] ?? 0,
        };
      }
      if (value && typeof value === "object") {
        const obj = value as Record<string, number>;
        return {
          a: typeof obj.a === "number" ? obj.a : 1,
          b: typeof obj.b === "number" ? obj.b : 0,
          c: typeof obj.c === "number" ? obj.c : 0,
          d: typeof obj.d === "number" ? obj.d : 1,
          e: typeof obj.e === "number" ? obj.e : 0,
          f: typeof obj.f === "number" ? obj.f : 0,
        };
      }
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    };

    globals.DOMMatrix = class {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
      is2D = true;

      constructor(init?: unknown) {
        const { a, b, c, d, e, f } = toComponents(init);
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
      }

      private assign(next: ReturnType<typeof toComponents>): this {
        this.a = next.a;
        this.b = next.b;
        this.c = next.c;
        this.d = next.d;
        this.e = next.e;
        this.f = next.f;
        return this;
      }

      multiplySelf(other?: unknown): this {
        const left = toComponents(this);
        const right = toComponents(other);
        return this.assign({
          a: left.a * right.a + left.c * right.b,
          b: left.b * right.a + left.d * right.b,
          c: left.a * right.c + left.c * right.d,
          d: left.b * right.c + left.d * right.d,
          e: left.a * right.e + left.c * right.f + left.e,
          f: left.b * right.e + left.d * right.f + left.f,
        });
      }

      preMultiplySelf(other?: unknown): this {
        const right = toComponents(this);
        const left = toComponents(other);
        return this.assign({
          a: left.a * right.a + left.c * right.b,
          b: left.b * right.a + left.d * right.b,
          c: left.a * right.c + left.c * right.d,
          d: left.b * right.c + left.d * right.d,
          e: left.a * right.e + left.c * right.f + left.e,
          f: left.b * right.e + left.d * right.f + left.f,
        });
      }

      translate(tx = 0, ty = 0): this {
        return this.multiplySelf({ e: tx, f: ty });
      }

      scale(scaleX = 1, scaleY = scaleX): this {
        return this.multiplySelf({ a: scaleX, d: scaleY });
      }

      invertSelf(): this {
        const { a, b, c, d, e, f } = toComponents(this);
        const det = a * d - b * c;
        if (det === 0) {
          return this.assign({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
        }
        return this.assign({
          a: d / det,
          b: -b / det,
          c: -c / det,
          d: a / det,
          e: (c * f - d * e) / det,
          f: (b * e - a * f) / det,
        });
      }

      toFloat32Array(): Float32Array {
        return new Float32Array([this.a, this.b, 0, 0, this.c, this.d, 0, 0, 0, 0, 1, 0, this.e, this.f, 0, 1]);
      }
    };
  }

  if (typeof globals.ImageData === "undefined") {
    globals.ImageData = class {
      data: Uint8ClampedArray;
      width: number;
      height: number;

      constructor(arg1: number | Uint8ClampedArray, arg2?: number, arg3?: number) {
        if (typeof arg1 === "number") {
          const width = arg1;
          const height = arg2 ?? 0;
          this.width = width;
          this.height = height;
          this.data = new Uint8ClampedArray(width * height * 4);
        } else {
          const data = arg1;
          const width = arg2 ?? 0;
          const height = arg3 ?? 0;
          this.width = width;
          this.height = height;
          this.data = data.length === width * height * 4 ? data : new Uint8ClampedArray(data);
        }
      }
    };
  }
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  ensurePdfJsPolyfills();

  type PdfParseClass = {
    new (params: { data: Buffer }): {
      getText: () => Promise<{ text: string }>;
      destroy: () => Promise<void>;
    };
    setWorker?: (workerSrc?: string) => string;
  };

  const { PDFParse } = (await import("pdf-parse")) as unknown as {
    PDFParse: PdfParseClass;
    default?: never;
  };

  if (typeof PDFParse.setWorker === "function") {
    PDFParse.setWorker("pdfjs-dist/legacy/build/pdf.worker.mjs");
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const cleaned = textResult.text.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      throw new Error("Could not extract text from resume");
    }
    return cleaned;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
