import * as d3 from 'd3';

export const getFilteredData = (data, filter, excludeFilter) => {
    return data.filter(d => {
        let isFiltered = true;
        if (
            excludeFilter !== "country" &&
            isFiltered &&
            d.hasOwnProperty("country") &&
            filter.country.size !== 0 &&
            !filter.country.has(d.country)
        ) {
            isFiltered = false;
        }

        if (
            excludeFilter !== "type" &&
            isFiltered &&
            d.hasOwnProperty("type") &&
            filter.type.size !== 0 &&
            !filter.type.has(d.type)
        ) {
            isFiltered = false;
        }

        if (
            excludeFilter !== "purpose" &&
            isFiltered &&
            d.hasOwnProperty("purpose") &&
            filter.purpose.size !== 0 &&
            !filter.purpose.has(d.purpose)
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("year") &&
            filter.yearRange.length === 2 &&
            !(d.year >= filter.yearRange[0] && d.year <= filter.yearRange[1])
        ) {
            isFiltered = false;
        }


        if (
            isFiltered &&
            d.hasOwnProperty("magnitude_body") &&
            filter.magnitude_body.length === 2 &&
            !(d.magnitude_body >= filter.magnitude_body[0] && d.magnitude_body <= filter.magnitude_body[1])
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("magnitude_surface") &&
            filter.magnitude_surface.length === 2 &&
            !(d.magnitude_surface >= filter.magnitude_surface[0] && d.magnitude_surface <= filter.magnitude_surface[1])
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("depth") &&
            filter.depth.length === 2 &&
            !(d.depth >= filter.depth[0] && d.depth <= filter.depth[1])
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("yeild_lower") &&
            filter.yeild_lower.length === 2 &&
            !(d.yeild_lower >= filter.yeild_lower[0] && d.yeild_lower <= filter.yeild_lower[1])
        ) {
            isFiltered = false;
        }

        if (
            isFiltered &&
            d.hasOwnProperty("yeild_upper") &&
            filter.yeild_upper.length === 2 &&
            !(d.yeild_upper >= filter.yeild_upper[0] && d.yeild_upper <= filter.yeild_upper[1])
        ) {
            isFiltered = false;
        }

        return isFiltered;
    })
}

export const scaleBandInvert = (scale) => {
    // var domain = scale.domain();
    // var paddingOuter = scale(domain[0]);
    // var eachBand = scale.step();
    // return function (value) {
    //     var index = Math.floor(((value - paddingOuter) / eachBand));
    //     return domain[Math.max(0, Math.min(index, domain.length - 1))];
    // }

    var domain = scale.domain()
    var range = scale.range()
    var invScale = d3.scaleQuantize().domain(range).range(domain)

    return function(val){
        return invScale(val)
    }

    // let domain = scale.domain();
    // let range = scale.range();
    // let rangePoints = d3.range(range[0], range[1], scale.step());
    // return function(val) {
    //     return domain[d3.bisect(rangePoints, val) -1];
    // }
}