import styles from '../styles/ProfilePhoto.module.css'

const ProfilePhoto = ({ name, profilePic, styling }) => {

    const pic = profilePic ? <img src={profilePic} /> : null;
    return (
        <object id={`profile-photo-${name}`} className={styles.profilePhotoBase} style={styling}>
            {pic}
            <div className={styles.photoBackdrop}><i>photo_camera</i></div>
        </object>
    );
}

export default ProfilePhoto;