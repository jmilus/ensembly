import Link from 'next/link';
import 'styles/sales.css';

const LandingPage = () => {
    return (
        <div className="sales-base-page">
            <div className="sales-header">
                <Link className="sales-button quiet" href="/login" style={{margin: "auto 0 auto"}}>Log In</Link>
            </div>
            <div className="sales-content">
                <div className="hero-splash">
                    <div className="logo">Ensembly</div>
                    <div className="slogan">
                        <span>We Love to Perform</span>
                    </div>
                </div>
                {/* <div className="dynamic-background">
                    <div className="big-one"></div>
                    <div className="little-one"></div>
                </div> */}
            </div>
        </div>
    )
}

export default LandingPage;