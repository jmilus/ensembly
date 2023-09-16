'use client'
import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Select } from 'components/Vcontrols';
import Newsletter from 'emails/templates/Newsletter';

const templateList = {
    Newsletter: <Newsletter />
}
const Previewer = () => {
    const [temp, setTemp] = useState(null)
    const [wide, setWide] = useState("wide")

    const changePreview = (t) => {
        const textHTML = `<div>${renderToStaticMarkup(templateList[t])}</div>`
        console.log(textHTML)
        setTemp(t)
    }

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <article>
                <section>
                    <Select id="template-selector" options={Object.keys(templateList)} extraAction={(v) => changePreview(v)} debug />
                    <button onClick={() => setWide(!wide)}>Change Width</button>
                </section>
                <article className="scroll" style={{ margin: "0 auto", width: wide ? "100%" : "500px" }}>
                    {templateList[temp]}
                </article>
            </article>
        </div>
    )
}

export default Previewer;