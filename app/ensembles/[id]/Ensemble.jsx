'use client'

import { useState, useContext } from 'react';

import { Form, Text } from '../../../components/Vcontrols/';
import { GlobalContext } from "../../../components/ContextFrame";

import basePageStyles from '../../../styles/basePage.module.css';

const EnsembleProfile = ({initialProps}) => {
    const { dispatch } = useContext(GlobalContext);

    const { ensemble } = initialProps;
    const { name, membership, typeId } = ensemble;

    const { divisions } = initialProps;

    console.log({ ensemble }, { membership }, { divisions });
    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <Form id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <Text id="name" field="name" value={ensemble.name} hero isRequired />
                    </Form>
                </div>
                <div className={basePageStyles.pageDetails}>
                    
                </div>
            </div>
        </div>

    )
    
}

export default EnsembleProfile;