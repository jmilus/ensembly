import ModalWrapper from '../../../../../../../components/ModalWrapper';
import { getOneEventModel } from '../../../../../../api/calendar/event/model/[model]/route';

import { Form, Number, Select, DateOnly, Collection } from '../../../../../../../components/Vcontrols';

import CALENDAR from '../../../../../../../utils/calendarUtils';
import { CAL } from '../../../../../../../utils/constants';
import Link from 'next/link';

const generateOccurrences = () => {
    const occurrences = {}
    CAL.weekday.long.forEach((ws, i) => {
        occurrences[ws] = {
                id: i,
                value: ws,
                period: 1,
                caption: ws,
                short: ws
            }
    })
    for (let x = 1; x <= 31; x++) {
        occurrences[`m-${x}`] = {
                id: x.toString(),
                value: x.toString(),
                period: 2,
                caption: x.toString(),
                short: x.toString()
            }
    }
    return occurrences;
}

export default async function AddEventModal(context) {
    const { model } = context.params;
    const eventModel = await getOneEventModel(model);

    const minStartdate = CALENDAR.getDashedValue(new Date(eventModel.modelStartDate), true)
    const dateArray = eventModel.recurrenceEndDate?.split('-')
    const recEndDate = dateArray ? CALENDAR.getDashedValue(new Date(dateArray[0], dateArray[1]-1, dateArray[2]), true) : ""
    
    const occurrenceOptionsSet = generateOccurrences()
    
    const formatOccurrenceValues = () => {
        const occ = Array.isArray(eventModel.occurrence) ? eventModel.occurrence : [eventModel.occurrence];
        return Object.values(occurrenceOptionsSet).filter(ocs => occ.includes(ocs.value))
    }

    const occurrenceValues = formatOccurrenceValues()

    return (
        <ModalWrapper title="Event Recurrence">
            <Form id="event-recurrence" METHOD="PUT" debug >
                <section className="modal-fields" style={{width:"600px"}}>
                    <Number id="recurrence-interval" name="interval" label="Every" value={eventModel.interval || 1} style={{maxWidth: "75px"}} isRequired />
                    <Select id="recurrence-period" name="period" label="Period" value={eventModel.period || 1} options={[{ id: 1, caption: "Week" }, { id: 2, caption: "Month" }]} isRequired style={{maxWidth:"100px"}} >
                        <Collection id="recurrence-occurrence" name="occurrence" label="Occurrence" value={occurrenceValues} options={occurrenceOptionsSet} filterKey="period" isRequired debug />
                    </Select>
                </section>
                <section className="modal-fields">
                    <DateOnly id="recurrence-end-date" name="recurrenceEndDate" label="End Recurrence" value={recEndDate || minStartdate} min={minStartdate} isRequired />
                </section>
            </Form>
            <section className="modal-buttons">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="event-recurrence">Save</button>
            </section>
        </ModalWrapper>
    )
}