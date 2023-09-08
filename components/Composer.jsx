'use client'

import React, { useRef, useEffect, useState, useCallback, forwardRef, useMemo } from 'react';
import { createEditor, Editor, Element as SlateElement, Transforms, Text, Path, Node } from 'slate'
import { Slate, Editable, ReactEditor, withReact, useSlateSelector, useFocused } from 'slate-react'
import { withHistory } from 'slate-history';

import { Color, Select } from './Vcontrols';

const emptyInitialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
]
  
const initialStyles = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    type: 'paragraph',
    size: '10',
    align: 'left'
}

const BUTTONS_INLINE_STYLES = [
    { caption: <i>format_bold</i>, style: "bold" },
    { caption: <i>format_italic</i>, style: "italic" },
    { caption: <i>format_underlined</i>, style: "underline" },
    { caption: <i>format_strikethrough</i>, style: "strikethrough" }
    
]

const BUTTONS_ALIGNMENT_STYLES = [
    { caption: <i>format_align_left</i>, style: "left" },
    { caption: <i>format_align_center</i>, style: "center" },
    { caption: <i>format_align_right</i>, style: "right" }
]

const TEXT_STYLES = [
    { id: '0', caption: 'Normal', value: 'paragraph' },
    { id: '1', caption: 'Heading 1', value: 'h1' },
    { id: '2', caption: 'Heading 2', value: 'h2' },
    { id: '3', caption: 'Heading 3', value: 'h3' },
    { id: '4', caption: 'Heading 4', value: 'h4' },
    { id: '5', caption: 'Heading 5', value: 'h5' },
    { id: '6', caption: 'Heading 6', value: 'h6' }
]

const TEXT_SIZES = [6, 8, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 56, 64].map(size => {
    return {id: size}
})

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const Composer = ({id, initialValue, contentOutput, readOnly, style}) => {
    const [styleState, setStyleState] = useState(initialStyles)
    const editor = useMemo(() => withReact(withHistory(createEditor())), [])
    //
    const renderElement = useCallback(props => <Element {...props} editor={editor} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    
    const slateValue = initialValue ? JSON.parse(initialValue) : emptyInitialValue;

    // console.log(moduleOptions);

    const StyleButton = ({ caption, styleProp, styleFunction, on }) => {

        const handleMouseDown = (e) => {
            e.preventDefault()
            console.log(`setting focus to`)
            ReactEditor.focus(editor)
            styleFunction()
        }
        return <button className={`style-toggle-button${on ? " on" : ""}`} onMouseDown={handleMouseDown}>{caption}</button>
    }

    const getFocusStyles = () => {
        let inline = {
            bold: [],
            italic: [],
            underline: [],
            strikethrough: [],
            size: [],
            color: [],
            background: []
        }

        const fragments = editor.getFragment();
        // console.log({fragments})
        const fragmentStyles = {
            type: fragments[0].type,
            align: fragments[0].align,
        }
        fragments.forEach(frag => {
            Object.keys(fragmentStyles).forEach(style => {
                if (fragmentStyles[style] != frag[style]) fragmentStyles[style] = ''
            })

            frag.children.forEach(leaf => {
                Object.keys(inline).forEach(key => {
                    inline[key].push(leaf[key])
                })

            })

            
        })

        let inlineStyles = {};
        Object.keys(inline).forEach(key => {
            inlineStyles[key] = inline[key].reduce((x, c) => x === c ? x : '')
        })
        // console.log({inlineStyles})
        
        setStyleState({ ...fragmentStyles, ...inlineStyles })
    }

    const Commands = {
        isInlineStyleActive(type) {
            const [match] = Editor.nodes(
                editor,
                {
                    match: n => n[type] === true,
                    universal: true
                }
            )

            return !!match
        },

        toggleInlineStyle(style) {
            const isActive = Commands.isInlineStyleActive(style)
            
            Transforms.setNodes(
                editor,
                { [style]: isActive ? null : true },
                { match: n => Text.isText(n), split: true }
            )
        },

        toggleAlignmentStyle(style) {
            // console.log(style)
            Transforms.setNodes(
                editor,
                { align: style },
                { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
            )
        },

        setTextStyle(style) {
            console.log(style);
            Transforms.setNodes(
                editor,
                { type: style },
                { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
            )
            
        },

        setTextSize(size) {
            console.log(size);
            Transforms.setNodes(
                editor,
                { size: size },
                { match: n => Text.isText(n), split: true }
            )
            
        },

        setTextColor(color) {
            console.log(color);
            Transforms.setNodes(
                editor,
                { color: color },
                { match: n => Text.isText(n), split: true }
            )
        },

        setHiLiteColor(color) {
            // console.log(color);
            Transforms.setNodes(
                editor,
                { background: color },
                { match: n => Text.isText(n), split: true }
            )
            
        }
    }

    const toggleBlock = (format) => {
        const isActive = isBlockActive(
            editor,
            format,
            TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
        )
        
        const isList = LIST_TYPES.includes(format)

        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type) &&
                !TEXT_ALIGN_TYPES.includes(format),
            split: true,
        })

        let newProperties;
        if (TEXT_ALIGN_TYPES.includes(format)) {
            newProperties = {
                align: isActive ? undefined : format,
            }
        } else {
            newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            }
        }
        
        Transforms.setNodes(editor, newProperties)

        if (!isActive && isList) {
            const block = { type: format, children: [] }
            Transforms.wrapNodes(editor, block)
        }    
        ReactEditor.focus(editor)
        console.log(editor.selection)
        Transforms.select(editor, editor.selection)
    }

    const isBlockActive = (editor, format, blockType = 'type') => {
        const { selection } = editor
        if (!selection) return false

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n[blockType] === format,
            })
        )

        return !!match
    }

    const promoteListItem = () => {
        Transforms.liftNodes(editor)
        const newNode = Editor.node(editor, editor.selection.anchor.path)
        console.log({ newNode })
        if (newNode[1].length === 2) {
            Transforms.setNodes(editor, {type: 'paragraph'})
        }
    }

    
    const onKeyDown = (e) => {
        // console.log(e)
        const { selection } = editor;
        const currentNode = Editor.node(editor, selection?.anchor.path);
        if (!currentNode) return;

        console.log({ currentNode })

        if (e.ctrlKey) {
            switch (e.key) {
                case 'b':
                    console.log("bold")
                    e.preventDefault();
    
                    Commands.toggleInlineStyle('bold');
                    break;
                case 'o':
                    console.log("ordered list");
                    e.preventDefault();

                    // let [match] = Editor.nodes(
                    //     editor,
                    //     { match: n => n.type === 'orderedlist' }
                    // )

                    toggleBlock('numbered-list')
                    break;
                case 'm':
                    e.preventDefault()
                    

                    console.log({ selection })

                default:
                    break;
            }

        } else {
            
            switch (e.key) {
                case 'Enter':
                    const nodeParent = Editor.parent(editor, currentNode[1]);
                    
                    const { text } = currentNode[0];
                    
                    if (nodeParent[0].type === 'list-item' && text === "") {
                        e.preventDefault()
                        promoteListItem()
                    }
                    break;
                case 'Tab':
                    const listItemPath = Path.parent(currentNode[1]);
                    const listItemNode = Editor.node(editor, listItemPath)
                    console.log({ listItemNode }, {listItemPath})
                    
                    if (listItemNode[0].type != 'list-item') break;
                    // if (listItemPath[listItemPath.length - 1] === 0) break;
                    
                    e.preventDefault()
                    if (e.shiftKey) {
                        promoteListItem();
                        break;
                    }

                    const elderSiblingNode = Editor.node(editor, Path.previous(listItemPath))
                    console.log({ listItemNode }, { elderSiblingNode })

                    // list-item
                    if (elderSiblingNode[0].type === 'list-item') {
                        const listItemParent = Editor.parent(editor, elderSiblingNode[1])
                        console.log({listItemParent})
                        const subChildren = []
                        Transforms.wrapNodes(editor, { type: 'numbered-list', children: subChildren })

                    // numbered-list
                    } else if (elderSiblingNode[0].type === 'numbered-list') {
                        const listType = elderSiblingNode[0].listType
                        let dest = [...elderSiblingNode[1]]
                        dest.push(elderSiblingNode[0].children.length)
                        console.log({ dest })
                        Transforms.moveNodes(editor, { at: listItemPath, to: dest })
                    }
                    break;
                default:
                    break;
            }
        }
    }

    const onChange = (value) => {
            const isAstChange = editor.operations.some(
              op => 'set_selection' !== op.type
            )
            if (isAstChange) {
                // console.log("content changed")
                const content = JSON.stringify(value)
                contentOutput(content)
            } else {
                // console.log("selection changed")
                getFocusStyles()
            }
    }

    return (
        <Slate
            editor={editor}
            value={slateValue || emptyInitialValue}
            onChange={onChange}
            >
            <div className="composer-container" style={style}>
                <div className="composer-textbox">
                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        onKeyDown={onKeyDown}
                        // autoFocus
                        spellCheck
                        style={{ padding: "0 15px" }}
                        readOnly={readOnly || false}
                        // onChange={onChange}
                    />
                    <div className="toolbar-wrapper">
                        <section>
                            <div className="">
                                <Select id={`text-style-${id}`} value={styleState.type} options={TEXT_STYLES} extraAction={(v) => Commands.setTextStyle(v)} specialSize="compact" />
                            </div>
                            <div className="">
                                <Select id={`text-size-${id}`} value={styleState.size === undefined ? 14 : styleState.size} options={TEXT_SIZES} extraAction={(v) => Commands.setTextSize(v)} specialSize="compact" />
                            </div>
                            <div className="rich-text-style-controls button-chain row">
                                <Color id='text-color' icon={<i>format_color_text</i>} extraAction={(v) => Commands.setTextColor(v)} />
                                <Color id='hilite-color' icon={<i>format_color_fill</i>} defaultColor="transparent" extraAction={(v) => Commands.setHiLiteColor(v)}  />
                            </div>
                            <div className="rich-text-style-controls button-chain row">
                                {
                                    BUTTONS_INLINE_STYLES.map((button, b) => {
                                        return (
                                            <StyleButton
                                                key={b}
                                                caption={button.caption}
                                                styleProp={button.style}
                                                styleFunction={() => Commands.toggleInlineStyle(button.style)}
                                                on={styleState[button.style]}
                                            />
                                        )
                                    })
                                }
                            </div>
                            <div className="rich-text-style-controls button-chain row">
                                {
                                    BUTTONS_ALIGNMENT_STYLES.map((button, b) => {
                                        return (
                                            <StyleButton
                                                key={b}
                                                caption={button.caption}
                                                styleProp={button.style}
                                                styleFunction={() => Commands.toggleAlignmentStyle(button.style)}
                                                on={styleState.align === button.style}
                                            />
                                        )
                                    })
                                }
                            </div>
                            <div className="rich-text-style-controls button-chain row">
                                <StyleButton
                                    caption={<i>format_list_numbered</i>}
                                    styleProp={'numbered-list'}
                                    styleFunction={() => toggleBlock('numbered-list')}
                                    on={isBlockActive(
                                        editor,
                                        'numbered-list',
                                        TEXT_ALIGN_TYPES.includes('numbered-list') ? 'align' : 'type'
                                    )}
                                />
                                <StyleButton
                                    caption={<i>format_list_bulleted</i>}
                                    styleProp={'bulleted-list'}
                                    styleFunction={() => toggleBlock('bulleted-list')}
                                    on={isBlockActive(
                                        editor,
                                        'bulleted-list',
                                        TEXT_ALIGN_TYPES.includes('bulleted-list') ? 'align' : 'type'
                                    )}
                                />
                            </div>
                            <div style={{ flex: 1 }}></div>
                            
                        </section>
                    </div>
                </div>
            </div>
        </Slate>
    )
}


const Element = ({ attributes, element, children, editor }) => {
    const { align, type, listType } = element;
    const style = { textAlign: align }

    switch (type) {
        case 'code':
            return null;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            const Header = forwardRef((props, ref) => {
                // console.log({ props }, { ref })
                return React.createElement(type, props)
            })
            Header.displayName = "Header-Component"
        
            return (
                <Header
                    type={type}
                    {...attributes}
                    style={style}
                >
                    {children}
                </Header>
            )
        
        case 'numbered-list':
            return (
                <ol
                    {...attributes}
                    type={listType}
                    style={style}
                >
                    {children}
                </ol>
            );
        
        case 'bulleted-list':
            return (
                <ul
                    {...attributes}
                    style={style}
                >
                    {children}
                </ul>
            )
        
        case 'list-item':
            return (
                <li
                    {...attributes}
                    style={style}
                >
                    {children}
                </li>
            )
        
        case 'paragraph':
        default:
            return (
                <p
                    {...attributes}
                    style={style}
                >
                    {children}
                </p>
            )
    }
}

const Leaf = props => {
    // console.log("leaf props:", props)
    const { leaf } = props;
    let styles = {padding: '2px 0'}
    if (leaf.bold) styles = { ...styles, fontWeight: 'bold' }
    if (leaf.italic) styles = { ...styles, fontStyle: 'italic' }
    if (leaf.underline || leaf.strikethrough) styles = { ...styles, textDecoration: `${leaf.underline ? 'underline' : ""} ${leaf.strikethrough ? ' line-through' : ""}` }
    if (leaf.size) styles = { ...styles, fontSize: `${leaf.size}px` || '14px' }
    if (leaf.color) styles = { ...styles, color: leaf.color }
    if (leaf.background) styles = { ...styles, backgroundColor: leaf.background }

    return (
      <span
        {...props.attributes}
        style={styles}
      >
        {props.children}
      </span>
    )
  }

export default Composer;