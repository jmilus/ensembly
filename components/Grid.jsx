'use client'

const Grid = (props) => {
    const { id, records } = props;

    const headers = Object.keys(records).map(r => r);

    return (
        <div id={id}>
            <table>
                <head>
                    <tr>
                        {
                            headers.map(head => <th>{head}</th>)
                        }
                    </tr>
                </head>
            </table>
        </div>
    )
}

export default Grid;