

const DateControl = ({ id, name, label, initialValue, maxValue, inheritedStyles }) => {

    const defineLimit = (limit) => {
        switch (limit?.type) {
            case "now":
                return new Date().toISOString().slice(0, 10);
            case "pad":
                const d = new Date();
                if (limit.year) d.setFullYear(d.getFullYear() - limit.year);
                if (limit.month) d.setMonth(d.getMonth() - limit.month);
                if (limit.day) d.setDate(d.getDate() - limit.day);
                return d;
            case "specific":
                return limit.date;
            default:
                break;
        }
        return null;
    }

    const displayDate = initialValue ? initialValue.slice(0, 10) : null;
    const maxDate = defineLimit(maxValue); 
    
    return (
        <object id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"}`} style={inheritedStyles}>
            <input
                id={id}
                name={name}
                type="date"
                defaultValue={displayDate}
                max={maxDate}
                autoComplete="do-not-autofill"
            />
            <label htmlFor={name} className="label" style={{top: "3px", left: "3px"}}>{label}</label>
        </object>
    );
}

export default DateControl;