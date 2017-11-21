import Source from '../source'

export default () => {

    return new Source('performance', (action) => {
        window.onload = function() {

            let timing = null;
            let resourceTiming = [];

            if (!window.performance) {
                return false;
            }

            timing = performance.timing;


            if (window.performance.getEntries) {
                const timings =  window.performance.getEntries();
                if (timings && timings.length > 0) {
                    const newResourceTiming = [];
                    timings.map((timing: any) => {
                        if (timing.entryType === "resource"
                            && timing.encodedBodySize
                            && timing.duration
                            && timing.encodedBodySize > 0
                            && timing.duration > 0) {
                            newResourceTiming.push(timing);
                        }

                    });

                    action({
                        category: 'performance',
                        payload:  {timing, resourceTiming: newResourceTiming}
                    });
                }

            } else {
                action({
                    category: 'performance',
                    payload:  {timing, resourceTiming: []}
                });
            }


        };


    })


}