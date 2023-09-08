import 'server-only';
import Image from 'next/image';

import { getOneEnsemble } from '../../api/ensembles/[id]/route';

import { Form, Text } from '../../../components/Vcontrols';

const EnsemblePage = async (context) => {

    const ensemble = await getOneEnsemble(context.params.id)
    // const {data, error} = supabase.storage.from('Logos').getPublicUrl(`${ensemble.logoUrl}`)
    const logoUrl = ''//data?.publicUrl

    return (
        <div className="page-base">
            {/* <div style={{ position: "relative", flex: 1, height: "100px" }}>
                <Image src={logoUrl} fill={true} alt="ensemble logo" style={{ objectFit: "contain" }} />
                
            </div> */}
        </div>
    )
}

export default EnsemblePage;

