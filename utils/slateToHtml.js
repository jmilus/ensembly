const TAG = {
    paragraph: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    ['numbered-list']: 'ol',
    ['bulleted-list']: 'ul',
    ['list-item']: 'li',
}

export const slateToHtml = (content) => {
    // console.log({ content })
    
    const handleChildren = (node) => {
        // console.log({ node })
        
        if (node.type) {
            let childrenHtml = "";
            let childAttr = "";
            
            if (node.children) {
                childrenHtml = node.children.map(child => {
                    return handleChildren(child);
                })
            }
            if (node.align) childAttr = `align=${node.align}`
            return `<${TAG[node.type]} ${childAttr}>${childrenHtml.join("")}</${TAG[node.type]}>`
        }

        if (node.text) {
            let textHtml = "";
            let textStyle = "";
            textHtml = `${node.bold ? "<b>" : ""}${node.italic ? "<i>" : ""}${node.underline ? "<u>" : ""}${node.strikethrough ? "<s>" : ""}`
            if (node.size || node.color || node.background) {
                textStyle = `<span style='${node.size ? `font-size:${node.size}px;` : ""}${node.color ? `color:${node.color};` : ""}${node.background ? `background:${node.background};` : ""}'>`
            }
            textHtml += textStyle + node.text;
            textHtml += textStyle != "" ? "</span>" : "";
            textHtml += `${node.strikethrough ? "</s>" : ""}${node.underline ? "</u>" : ""}${node.italic ? "</i>" : ""}${node.bold ? "</b>" : ""}`
            return textHtml;
        }
    }

    const html = content.map(block => {
        const contentBlock = JSON.parse(block.content)
        // console.log({contentBlock})
        const blockHtml = contentBlock.map(con => handleChildren(con)).join("")
        return `<div>${blockHtml}</div>`
    })

    return `<div>${html.join("")}</div>`;
}

