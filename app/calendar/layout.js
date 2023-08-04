import 'server-only'

import SecurityWrapper from '../../components/SecurityWrapper';

const CalendarLayout = (context) => {
    return (
        <SecurityWrapper currentModule="calendar">
            {context.children}
        </SecurityWrapper>
    )
}

export default CalendarLayout;