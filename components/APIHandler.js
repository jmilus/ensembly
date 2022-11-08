import { useState, useEffect } from 'react';
import useSWR from 'swr';

import Modal from '../components/Modal';

const APIHandler = (key, fetcher) => {
    const { data, error } = useSWR(key, fetcher);

    console.log("APIHandler fired");

    const StatusModal = () => {
        if (error) return <Modal parameters={ {type:"error", message: error} } />
        
        if (!data && !error) return <Modal parameters={{type:"loading"}} />
        console.log("returning null");
        return null;

    }


    return { data, StatusModal }
}

export default APIHandler;