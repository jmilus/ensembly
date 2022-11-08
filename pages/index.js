import { useContext } from 'react';
import { GlobalContext } from './_app';
import Head from 'next/head'

import styles from '../styles/Home.module.css'

export default function Home() {
  const { parameters, dispatch } = useContext(GlobalContext);
  if(parameters?.config)
  return (
    <div className={styles.container}>
      Home Page
    </div>
  )
}