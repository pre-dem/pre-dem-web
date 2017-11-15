import Source from '../source'

export default () => {

    return new Source('performance', (action) => {
        window.onload = function() {
            const timings =  window.performance.getEntries();
            let navigationTiming = null;
            if (timings && timings.length > 0) {
                navigationTiming = timings[0];
                timings.splice(0, 1);
            }
            const newResourceTiming = [];
            timings.map((timing: any) => {
                if (timing.transferSize && timing.transferSize > 0 &&
                    timing.entryType !== 'resource') {
                    newResourceTiming.push(timing);
                }
            });
            action({
                category: 'performance',
                payload:  {navigationTiming, resourceTiming: newResourceTiming}
            });
        };


    })


}