import type MarkdownIt from "markdown-it"
import container from "markdown-it-container"
import type { Token } from "markdown-it"

interface MarpitTokenMeta {
  marpitSlideElement?: 1 | -1
}

type MarpitToken = Token & {
  meta?: MarpitTokenMeta
}

export default function fragmentPlugin(md: MarkdownIt): void {
  md.use(container, "fragment", {
    marker: ":",

    validate(params: string): boolean {
      return params.trim() === "fragment"
    },

    render(tokens: Token[], index: number): string {
      const token = tokens[index]

      if (token.nesting === 1) {
        return '<div class="marp-custom-fragment">\n'
      }

      return "</div>\n"
    }
  })

  /*
   * markdown-it-container creates tokens named:
   *
   *   container_fragment_open
   *   container_fragment_close
   *
   * We add Marpit's fragment attributes to each opening token.
   */
  md.core.ruler.after(
    "marpit_apply_fragment",
    "marp_custom_fragments",
    (state): void => {
      if (state.inlineMode) return

      let slide: MarpitToken | undefined
      let count = 0

      for (const rawToken of state.tokens) {
        const token = rawToken as MarpitToken
        const meta = token.meta

        if (meta?.marpitSlideElement === 1) {
          slide = token
          count = 0
          continue
        }

        if (meta?.marpitSlideElement === -1) {
          if (slide && count > 0) {
            slide.attrSet(
              "data-marpit-fragments",
              String(count)
            )
          }

          slide = undefined
          continue
        }

        if (
          slide &&
          token.type === "container_fragment_open"
        ) {
          count += 1
          token.attrSet(
            "data-marpit-fragment",
            String(count)
          )
        }
      }
    }
  )
}
