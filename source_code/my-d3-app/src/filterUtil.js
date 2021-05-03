export const getFilteredData = (data, filter, excludeFilter) => {
    return data.filter(d => {
        let isFiltered = true;
        if (
            excludeFilter !== "country" &&
            isFiltered &&
            d.hasOwnProperty("country") &&
            filter.country.size != 0 &&
            !filter.country.has(d.country)
        ) {
            isFiltered = false;
        }

        if (
            excludeFilter !== "type" &&
            isFiltered &&
            d.hasOwnProperty("type") &&
            filter.type.size != 0 &&
            !filter.type.has(d.type)
        ) {
            isFiltered = false;
        }

        if (
            excludeFilter !== "purpose" &&
            isFiltered &&
            d.hasOwnProperty("purpose") &&
            filter.purpose.size != 0 &&
            !filter.purpose.has(d.purpose)
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("year") &&
            filter.yearRange.length == 2 &&
            !(d.year >= filter.yearRange[0] && d.year <= filter.yearRange[1])
        ) {
            isFiltered = false;
        }

        return isFiltered;
    })
}