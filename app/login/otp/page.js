import 'server-only';
import Link from 'next/link';

export default function AfterMagicLink() {


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
                    <i style={{fontSize: "4em", color: "red", marginRight: "20px"}}></i>
                    <h2>Check Your Email.</h2>
                </div>
                <p>{`We've sent a link to your email. If you don't see it in a few moments, check your Spam filter, or...`}</p>
                <Link href="/login" className="fat">Try Another Method?</Link>
                    {/* <button
                        className="fat"
                        style={{['--edge-color']: 'var(--color-h2)'}}
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                    >
                        Try again?
                    </button> */}

            </div>
        </div>
    )
}