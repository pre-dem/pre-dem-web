import Source from '../source'
<<<<<<< HEAD
import {parse} from 'url'
import {getDomainFromUrl} from './../utils'
=======
import {getDominFromUrl} from './../utils'
>>>>>>> 2636f2a8cddca215ba42fab45e83d41868af9994

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

              var cleanObject = JSON.parse(JSON.stringify(resourceTiming))
              const domainAndPath = getDomainFromUrl(cleanObject.name);
              cleanObject.domain = domainAndPath.domain
              cleanObject.path = domainAndPath.path
              newResourceTimings.push(cleanObject);
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