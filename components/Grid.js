

const Grid = (props) => {
    const { children, columns, rows } = props;

    const gridStyle = {
        gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : 'unset',
        gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : 'unset'
    }

    return (
        <fast-grid style={gridStyle}>
            {children}
        </fast-grid>
    )

}

export default Grid;