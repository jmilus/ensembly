'use client'

import { useRouter, usePathname } from "next/navigation";

import {Select} from 'components/Vcontrols';

export const LineupSelector = ({ value, lineups }) => {
    const router = useRouter();
    const path = usePathname();

    const nextPath = path.slice(0, path.indexOf('lineup') + 6)

    return (
        <div>
            <Select id="lineup-selector" label="Lineup" value={value} options={lineups} extraAction={(v) => router.push(`${nextPath}/${v}`)} hero debug/>
        </div>
    )
}