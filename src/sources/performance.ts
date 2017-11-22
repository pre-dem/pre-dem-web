import Source from '../source'

export default () => {

  return new Source('performance', (action) => {
    window.onload = function () {

      let timing = null;
      const newResourceTimings = [];

      if (!window.performance) {
        return false;
      }

      timing = performance.timing;


      if (window.performance.getEntries) {
        const resourceTimings = window.performance.getEntries();
        if (resourceTimings && resourceTimings.length > 0) {
          resourceTimings.map((resourceTiming: any) => {
            if (resourceTiming.entryType === "resource") {
              newResourceTimings.push(timing);
            }

          });

          action({
            category: 'performance',
            payload: {timing, resourceTimings: newResourceTimings}
          });
        }

      } else {
        action({
          category: 'performance',
          payload: {timing, resourceTimings: []}
        });
      }


    };


  })


}