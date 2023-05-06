'use client'

import styles from '../styles/ProfilePhoto.module.css'
import Image from 'next/image';

const ProfilePhoto = ({ name, profilePic, styling }) => {

    const pic = profilePic ? <Image src={profilePic} alt="" /> : null;
    return (
        <object id={`profile-photo-${name}`} className={styles.profilePhotoBase} style={styling}>
            {pic}
            <div className={styles.photoBackdrop}><i>photo_camera</i></div>
        </object>
    );
}

export default ProfilePhoto;