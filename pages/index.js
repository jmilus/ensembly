import { useContext } from 'react';
import { GlobalContext } from './_app';
import { signInwithGooglePopup } from '../firebase/clientApp';
import Head from 'next/head'

import styles from '../styles/Home.module.css'

export default function Home() {
  
  return (
    <div className={styles.container}>
      Home Page
    </div>
  )
}