import container from "markdown-it-container"

export default function fragmentPlugin(md) {
  md.use(container, "fragment", {
    marker: ":",

    validate(params) {
      return params.trim(),match(/^fragment\s+(.*)$/)
    },

    render(tokens, index) {
      const token = tokens[index]

      if (token.nesting === 1) {
        return `<div${md.renderer.renderAttrs(token)}>\n`
      }

      return "</div>\n"
    }
  })

  md.core.ruler.after(
    "marpit_apply_fragment",
    "marp_custom_fragments",
    (state) => {
      if (state.inlineMode) return

      let slide = null
      let count = 0

      for (const token of state.tokens) {
        if (token.meta?.marpitSlideElement === 1) {
          slide = token
          count = 0
          continue
        }

        if (token.meta?.marpitSlideElement === -1) {
          if (slide && count > 0) {
            slide.attrSet(
              "data-marpit-fragments",
              String(count)
            )
          }

          slide = null
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
