import { getOneEvent } from "../../../../../api/calendar/event/[id]/route";
import { getAttendance } from "../../../../../api/calendar/event/[id]/take-attendance/[member]/route";
import { getAttendanceStatus } from "../../../../../api/calendar/event/[id]/take-attendance/route";
import { getAllAssignments } from "../../../../../api/ensembles/[id]/lineup/[lineup]/assignments/route";

import ModalWrapper from "../../../../../../components/ModalWrapper";
import FilterContainer from "../../../../../../components/FilterContainer";
import { Form, Radio } from '../../../../../../components/Vcontrols';


export default async function Attendance(context) {
    const event = await getOneEvent(context.params.id);
    const eventAttendance = event.Attendance
    const AttendanceStatus = await getAttendanceStatus()
    const assignments = await getAllAssignments(event.lineups.map(l => l.id))

    AttendanceStatus.sort((as1, as2) => {
        return as1.id - as2.id
    })

    const attendance = {}
    eventAttendance.forEach(ea => {
        attendance[ea.member] = ea
    })

    return (
        <ModalWrapper title="Attendance">
            <FilterContainer
                id="attendance-filter"
                filterTag="attendee"
                columns={{ c: 1, w: "1fr" }}
                search={{ label: "Search", searchProp: "name" }}
                Vstyle={{width: "750px"}}
            >
                <div className="attendance-container">
                    <div className="attendance-row slider">
                        <div className="attendance-name"></div>
                        {
                            AttendanceStatus.map((status, s) => {
                                return <div key={s} className="attendance-header radio-option">{status.type}</div>
                            })

                        }
                    </div>
                    <article className="scroll">
                        {
                            assignments.map((assignment, m) => {
                                const { Member } = assignment.EnsembleMembership;
                                return (
                                    <Form key={m} id={`${Member.id}-attendance-form`} METHOD="PUT" APIURL={`${Member.id}`} auto>
                                        <div className="attendance-row" tag="attendee" name={Member.aka}>
                                            <div className="attendance-name">{Member.aka}</div>
                                            <Radio id={Member.id} name="status" value={attendance[Member.id]?.status || 1} type="slider" options={AttendanceStatus} debug={Member.id === '0f7f9f27-7588-4d9f-91d5-9ad54dbef507'} />
                                        </div>
                                    </Form>
                                )
                            })
                        }
                    </article>
                </div>
            </FilterContainer>
        </ModalWrapper>
    )
}