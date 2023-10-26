import 'server-only';

import packageJSON from '../../../../package.json' assert {type: 'json'};

export default async function GeneralSettingsPage(context) {
    return <div>Version: {packageJSON.version}</div>
}