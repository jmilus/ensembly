'use client'

import Image from 'next/image';

const ProfilePhoto = ({ id, name, profilePic, style }) => {

    const pic = profilePic ? <Image src={profilePic} alt="" /> : null;
    return (
        <div id={id} className="feature-photo" style={style}>
            {pic}
            <div className="photo-backdrop"><i>photo_camera</i></div>
        </div>
    );
}

export default ProfilePhoto;