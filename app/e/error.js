'use client'
 
import { useEffect } from 'react'
 
export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error)
    }, [error])
    
    return (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <div style={
                {
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                    width: "500px",
                    backgroundColor: "var(--gray2)",
                    padding: "50px",
                    justifyContent: "center",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow1)",
                }}>
                <div style={{ display: "flex" }}>
                    <i style={{fontSize: "4em", color: "red", marginRight: "20px"}}>error_outline</i>
                    <h2>Something went wrong!</h2>
                </div>
                <p>{`The app has encountered an error. We'll get to work on it right away, but in the meantime, you could:`}</p>
                <button
                    className="fat"
                    style={{['--edge-color']: 'var(--color-h2)'}}
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </button>
            </div>
        </div>
    )
}