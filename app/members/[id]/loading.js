import basePageStyles from '../../../styles/basePage.module.css';

export default function Loading() {
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    Loading Member Profile...
                </div>
                <div className={basePageStyles.pageDetails}>
                    <article className="padded">
                        <div id="member-photo" className={basePageStyles.profileSegment}>
                            
                        </div>
                        <div id="member-bio" className={basePageStyles.profileSegment}>
                            
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        
                                    </section>
                                    <section>
                                        
                                    </section>
                                    <section>
                                        
                                    </section>
                                    <section>
                                        
                                    </section>
                                </fieldset>
                        </div>
                    </article>
                        
                    <article className="padded">
                        <div id="member-contacts" className={basePageStyles.profileSegment}>
                            <fieldset>
                                <legend>Contact Info</legend>
                                <section>
                                    
                                </section>
                               
                            </fieldset>
                            
                        </div>
                    </article>

                    <article className="padded">
                        <div id="memberships" className={basePageStyles.profileSegment} style={{gridRowStart:"span 2"}}>
                            <fieldset className="button-stack">
                                <legend>Membership</legend>
                                <div id="ensemble-membership-list">
                                </div>
                                
                            </fieldset>
                        </div>
                    </article>
                    
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                
            </div>
        </div>
    )
}