import Text from './controls/Text';
import Number from './controls/Number';
import DateTime from './controls/Date';
import Select from './controls/Select';
import CheckBox from './controls/CheckBox';
import MultiSelect from './controls/MultiSelect';
import File from './controls/File';

const VControl = () => {
    return <></>
}

VControl.Text = (props) => <Text {...props} />;
VControl.Number = (props) => <Number {...props} />;
VControl.Date = (props) => <DateTime {...props} />;
VControl.Select = (props) => <Select {...props} />;
VControl.Check = (props) => <CheckBox {...props} />;
VControl.Multi = (props) => <MultiSelect {...props} />
VControl.File = (props) => <File {...props} />;

export default VControl;