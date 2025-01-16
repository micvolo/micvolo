import { marked } from "marked";

let openDiv = false;
let isDescription = false;

marked.use({
    renderer: {
        paragraph(token) {
            if (token.tokens.length === 1 && token.tokens[0].type === "link") {
                token.tokens[0].title = `single`;
                return `${this.parser.parseInline(token.tokens)}`;
            }
            if (token.tokens.length === 1 && token.tokens[0].type === "image") {
                return `${this.parser.parseInline(token.tokens)}`;
            }
            return `<p>${this.parser.parseInline(token.tokens)}</p>`;
        },
        html(token) {
            if (token.text.includes(`class="description"`))
                isDescription = true;

            if (token.text.includes(`</div>`) && isDescription)
                isDescription = false;

            return token.text;
        },
        link(token) {
            const target = !token.href.startsWith("/") ? "target='_blank'" : "";
            const classList =
                token.title && !isDescription ? `class='${token.title}'` : "";
            return `<a href="${token.href}" ${target} ${classList}>${this.parser.parseInline(token.tokens)}</a>`;
        },
        heading(token) {
            let beforeDiv = openDiv
                ? `</div><div class="paragraph">`
                : `<div class="paragraph">`;
            openDiv = true;
            return `${beforeDiv}<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
        },
        image(token) {
            return `<div class="img"><img src="${token.href}" alt=${token.text} class="${token.title}"></div>`;
        },
    },
    hooks: {
        postprocess: (e) => {
            if (openDiv) {
                e += `</div>`;
                openDiv = false;
            }
            return e;
        },
    },
});